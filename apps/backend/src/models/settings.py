from models.base import BaseSchema
from typing import Literal

class SettingsResponse(BaseSchema):
    theme: Literal["light", "dark", "system"]
    language: str
    notifications_enabled: bool

class UpdateSettingsRequest(BaseSchema):
    theme: Literal["light", "dark", "system"] | None
    language: str | None
    notifications_enabled: bool | None