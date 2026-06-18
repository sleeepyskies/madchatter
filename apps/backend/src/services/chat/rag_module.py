from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_ollama import ChatOllama

from repositories.knowledge_base_repository import KnowledgeBase

DEFAULT_SYSTEM_PROMPT = """
You are a helpful assistant that answers questions based on retrieved context and chat history.

Keep answers concise.

Use no more than 20 words unless the user explicitly asks for details.

Avoid repetition and unnecessary explanations."""

class RAG:
    """RAG (Retrieval-Augmented Generation) class that integrates a knowledge repository with a ChatOllama language model
    to answer user questions based on retrieved context and chat history.
    """

    def __init__(self, chroma_collection: str | None = None, system_prompt: str | None = None):
        self.llm = ChatOllama(model="llama3.2")
        self.repo = (
            KnowledgeBase(chroma_collection)
            if chroma_collection
            else None
        )
        self.system_prompt = system_prompt or DEFAULT_SYSTEM_PROMPT
        self.chain = self._setup_rag_chain()


    def _setup_rag_chain(self):
        prompt = ChatPromptTemplate.from_messages([
            ("system",
             "{system_prompt}\n\nBackground:\n{context}"),
            MessagesPlaceholder(variable_name="history"),
            ("human", "Answer the following questions: {question}")
        ])

        def get_context(question):
            if not self.repo:
                return ""

            docs = self.repo.get_retriever().invoke(question)
            return format_docs(docs)

        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)

        return (
                {
                    "context": lambda x: get_context(x["question"]),
                    "question": lambda x: x["question"],
                    "history": lambda x: x["chat_history"],
                    "system_prompt": lambda x: self.system_prompt
                }
                | prompt
                | self.llm
                | StrOutputParser()
        )

    def ask_stream(self, question: str, history_messages: list):
        """Stream the answer to a question based on the RAG chain, given the question and chat history."""
        langchain_messages = []
        for msg in history_messages:
            if msg["role"] == "user":
                langchain_messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                langchain_messages.append(AIMessage(content=msg["content"]))

        for chunk in self.chain.stream({
            "question": str(question),
            "chat_history": langchain_messages
        }):
            yield chunk
