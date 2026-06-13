import uuid
from pathlib import Path

from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_core.vectorstores import VectorStoreRetriever
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from api.api_exception import InvalidArgumentException
from settings import settings


class KnowledgeBase:
    """
    KnowledgeBase acts as an interface to the vectorized database.

    We instantiate a new instance of this class per collection.
    """

    def __init__(self, collection_name: str):
        """
        Creates a KnowledgeBase instance for a collection. If no collection with this name exists,
        a new collection will be created on disk. Otherwise, the existing collection will be referenced.
        :param collection_name: Name of the collection.
        """
        self.embeddings = OllamaEmbeddings(model="nomic-embed-text")
        self.collection_name = collection_name
        if settings.vector_db_url:
            self.persist_directory = settings.vector_db_url.replace("chroma:///", "")
        else:
            self.persist_directory = settings.vector_db_url

        self.vector_store = Chroma(
            embedding_function=self.embeddings,
            collection_name=self.collection_name,
            persist_directory=self.persist_directory,
        )

    def get_retriever(self) -> VectorStoreRetriever:
        """Return a LangChain retriever interface for the vector store."""
        return self.vector_store.as_retriever()

    def add_file(self, filepath: Path) -> list[str]:
        """
        Adds a new file to this collection. Any file passed in is split into documents.
        Returns a list of the document ids added.
        """

        ext = Path(filepath).suffix
        if ext.lower() == ".pdf":
            initial_documents = PyPDFLoader(str(filepath)).load()
        elif ext.lower() in [".txt", ".md"]:
            with open(filepath, "r", encoding="utf-8") as f:
                text = f.read()
            initial_documents = [Document(page_content=text, metadata={"source": filepath})]
        else:
            raise InvalidArgumentException(f"Files of type {ext.lower()} are not supported")

        chunked_documents = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        ).split_documents(initial_documents)

        document_ids = [uuid.uuid4().hex for _ in range(len(chunked_documents))]

        self.vector_store.add_documents(
            documents=chunked_documents,
            ids=document_ids
        )

        return document_ids

    def delete_documents(self, document_ids: list[str]) -> None:
        """Deletes the provided documents from the knowledge base."""
        self.vector_store.delete(document_ids)

    def erase_collection(self) -> None:
        """Completely wipes the whole knowledge base. And removes any instance of it from disk."""
        self.vector_store.delete_collection()
