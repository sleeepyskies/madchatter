from repositories.settings_repository import SettingsRepository, UpdateSettings
from models.settings import SettingsResponse, UpdateSettingsRequest


class SettingsService:
    """Handles settings business logic."""

    def __init__(self, repository: SettingsRepository):
        self.repository = repository

    def get_settings(self) -> SettingsResponse:
        settings = self.repository.get()
        if settings is None:
            settings = self.repository.create_default()
        return SettingsResponse.model_validate(settings)

    def update_settings(self, request: UpdateSettingsRequest) -> SettingsResponse:
        updated_settings = self.repository.update(UpdateSettings(
            theme=request.theme,
            language=request.language,
            notifications_enabled=request.notifications_enabled,
        ))
        return SettingsResponse.model_validate(updated_settings)
