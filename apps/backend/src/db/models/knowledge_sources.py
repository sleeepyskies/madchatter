from sqlalchemy import ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class KnowledgeSource(Base):
    """
    Represents some knowledge source that has been uploaded to ChromaDB.

    The reason we maintain copies of all uploaded files is to allow client editing of knowledge bases.
    Since vectorizing a PDFs content does not preserve the original data, we must do this.

    All files are saved to settings.files_dir during runtime.
    """
    __tablename__ = "knowledge_sources"

    id: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    """ID of the row."""

    label: Mapped[str] = mapped_column(nullable=False)
    """User defined name of the file."""

    vector_collection_id: Mapped[int] = mapped_column(
        ForeignKey("vector_collections.id", ondelete="CASCADE"),
        nullable=False
    )
    """ID of the collection this file belongs to."""

    documents: Mapped[list[str]] = mapped_column(JSON, default=list)
    """
    A list of document IDs belonging to this document within the ChromaDB collection. 
    We must retain this in order to properly upsert into a knowledge base.
    """

    filename: Mapped[str] = mapped_column(nullable=False, unique=True)
    """Actual name of the file saved to disk. Used over knowledge_sources.label to avoid naming conflicts."""
