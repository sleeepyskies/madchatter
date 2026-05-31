from models.preferences import PreferencesResponse, UpdatePreferencesRequest
from repositories.preferences_repository import PreferencesRepository, UpdatePreferences


class PreferencesService:
    """Handles settings business logic."""

    def __init__(self, repository: PreferencesRepository):
        self.repository = repository

    def get_preferences(self) -> PreferencesResponse:
        preferences = self.repository.get()
        if preferences is None:
            preferences = self.repository.create_default()
        return PreferencesResponse.model_validate(preferences)

    def update_preferences(self, request: UpdatePreferencesRequest) -> PreferencesResponse:
        updated = self.repository.update(UpdatePreferences(
            theme=request.theme,
            language=request.language,
            notifications_enabled=request.notifications_enabled,
        ))
        return PreferencesResponse.model_validate(updated)
