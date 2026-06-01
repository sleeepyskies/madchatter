from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage
from repositories.knowledge_base_repository import KnowledgeRepository


class RAG:
    """RAG (Retrieval-Augmented Generation) class that integrates a knowledge repository with a ChatOllama language model
    to answer user questions based on retrieved context and chat history.
    """
    def __init__(self):
        self.llm = ChatOllama(model="llama3.2")
        self.repo = KnowledgeRepository()
        self.chain = self._setup_rag_chain()

    def _setup_rag_chain(self):
        prompt = ChatPromptTemplate.from_messages([
            ("system",
             "You are a capable assistant, answering user questions based on the following background information, answer should be brief within 10 words. You MUST always answer in German only. Background: {context}"),
            MessagesPlaceholder(variable_name="history"),
            ("human", "Answer the following questions: {question}")
        ])

        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)
        return (
                {
                    "context": (lambda x: x["question"]) | self.repo.get_retriever() | format_docs,
                    "question": lambda x: x["question"],
                    "history": lambda x: x["chat_history"]
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