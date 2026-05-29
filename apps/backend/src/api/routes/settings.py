from fastapi import APIRouter, Depends

from api.dependencies import get_settings_service
from models.settings import SettingsResponse, UpdateSettingsRequest
from services.settings_service import SettingsService

SETTINGS_PREFIX = "/settings"

router = APIRouter(prefix=SETTINGS_PREFIX, tags=["settings"])


@router.get("", response_model=SettingsResponse)
def get_settings(settings_service: SettingsService = Depends(get_settings_service)):
    return settings_service.get_settings()


@router.patch("", response_model=SettingsResponse)
def update_settings(
        request: UpdateSettingsRequest,
        settings_service: SettingsService = Depends(get_settings_service),
):
    return settings_service.update_settings(request)
