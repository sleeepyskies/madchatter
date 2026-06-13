from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class VectorCollection(Base):
    """
    Represents a vectorized collection inside of the ChromaDB database.

    Note that this is not the actual vectorized data, but simply a reference to it.

    To access the data, see:
    """
    __tablename__ = "vector_collections"

    id: Mapped[int] = mapped_column(primary_key=True, nullable=False)
    """ID of the row."""

    label: Mapped[str] = mapped_column(nullable=False)
    """User provided label for the knowledge base."""

    chroma_collection: Mapped[str] = mapped_column(nullable=False, unique=True)
    """ID of the collection inside of ChromaDB. Use this and not id this for querying with ChromaDB!!"""
