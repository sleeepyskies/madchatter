from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
from settings import settings


class KnowledgeRepository:
    def __init__(self):
        """
        Initialize the knowledge repository with:
        """
        self.embeddings = OllamaEmbeddings(model="nomic-embed-text")
        
        raw_url = settings.vector_db_url
       
        if raw_url.startswith("chroma:///"):
            clean_path = raw_url.replace("chroma:///", "")

        self.vector_store = Chroma(
            embedding_function=self.embeddings,
            collection_name="my_knowledge_base",
            persist_directory=clean_path  
        )
        
        self._init_knowledge_base()

    def _init_knowledge_base(self):
        """
        Initialize the vector database with default knowledge data.

        This function runs only when the vector store is empty.
        It inserts a predefined document set to bootstrap the knowledge base.

        """
        if self.vector_store._collection.count() == 0:
            raw_text = (
                "The Hochschule der Bildenden Kunste Saar (HBKsaar) was formally established "
                "as an independent institution in 1989 through legislation enacted by the state of Saarland. "
                "Its foundation marked the continuation and restructuring of earlier art and design education "
                "in the region, particularly from the postwar Schule für Kunst und Handwerk, which had operated "
                "within the former Fachhochschule des Saarlandes since the 1970s."
            )

            docs = [Document(page_content=x) for x in raw_text.strip().split("\n")]

            self.vector_store.add_documents(
                documents=docs,
                ids=["id" + str(i) for i in range(1, len(docs) + 1)]
            )

    def get_retriever(self):
        """
        Return a LangChain retriever interface for the vector store.
        """
        return self.vector_store.as_retriever()