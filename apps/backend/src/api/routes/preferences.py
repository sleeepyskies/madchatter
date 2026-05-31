from fastapi import APIRouter, Depends

from api.dependencies import get_preferences_service
from models.preferences import PreferencesResponse, UpdatePreferencesRequest
from services.preferences_service import PreferencesService

SETTINGS_PREFIX = "/preferences"

router = APIRouter(prefix=SETTINGS_PREFIX, tags=["preferences"])


@router.get("", response_model=PreferencesResponse)
def get_preferences(preferences_service: PreferencesService = Depends(get_preferences_service)):
    return preferences_service.get_preferences()


@router.patch("", response_model=PreferencesResponse)
def update_preferences(
        request: UpdatePreferencesRequest,
        preferences_service: PreferencesService = Depends(get_preferences_service),
):
    return preferences_service.update_preferences(request)
