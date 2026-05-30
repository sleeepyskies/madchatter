from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base


class UserPreferences(Base):
	"""Stores application settings and preferences."""
	__tablename__ = "user_preferences"

	id: Mapped[int] = mapped_column(Integer, primary_key=True)
	"""Singleton record identifier."""
	theme: Mapped[str] = mapped_column(String(16), nullable=False, default="system")
	"""Preferred theme: light, dark, or system."""

	language: Mapped[str] = mapped_column(String(8), nullable=False, default="en")
	"""Preferred UI language code."""

	notifications_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
	"""Whether in-app notifications are enabled."""