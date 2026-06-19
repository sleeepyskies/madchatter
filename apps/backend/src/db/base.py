from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all database models, acts as a global table registry."""

    def __repr__(self) -> str:
        """Return a string representation of the model."""
        # strange syntax but we join strings using ", " as separator
        attributes = ", ".join(
            f"{key}={getattr(self, key)!r}"
            for key in self.__mapper__.columns.keys()
        )
        return f"<{self.__class__.__name__} {attributes}>"
