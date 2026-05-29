from dataclasses import dataclass
from typing import Literal

from sqlalchemy.orm import Session

from db.models.user_preferences import UserPreferences

Language = Literal["en", "de"]

@dataclass
class UpdateSettings:
    theme: str | None
    language: Language | None
    notifications_enabled: bool | None


class SettingsRepository:
    """Provides access to the database for settings and user preferences."""

    def __init__(self, database: Session) -> None:
        self.database = database

    def get(self) -> UserPreferences | None:
        return self.database.get(UserPreferences, 1)

    def create_default(self) -> UserPreferences:
        preferences = UserPreferences(
            id=1,
            theme="system",
            language="en",
            notifications_enabled=True,
        )
        self.database.add(preferences)
        self.database.commit()
        self.database.refresh(preferences)
        return preferences

    def update(self, settings: UpdateSettings) -> UserPreferences:
        preferences = self.get()
        if preferences is None:
            preferences = self.create_default()

        if settings.theme is not None:
            preferences.theme = settings.theme
        if settings.language is not None:
            preferences.language = settings.language
        if settings.notifications_enabled is not None:
            preferences.notifications_enabled = settings.notifications_enabled

        self.database.commit()
        self.database.refresh(preferences)
        return preferences
