from sqlalchemy.orm import Mapped
from sqlalchemy.testing.schema import mapped_column

from db.base import Base


class KvStore(Base):
    """
    Table used for storing key value pairs. Main use case is storing global application wide state.
    """

    __tablename__ = "kv_store"

    key: Mapped[str] = mapped_column(primary_key=True, nullable=False, unique=True)
    """Key for this entry."""

    value: Mapped[str | None] = mapped_column(nullable=True)
    """Value for this entry."""
