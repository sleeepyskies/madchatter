from models.base import BaseSchema
from typing import Literal

Language = Literal["en", "de"]

class SettingsResponse(BaseSchema):
    theme: Literal["light", "dark", "system"]
    language: Language
    notifications_enabled: bool

class UpdateSettingsRequest(BaseSchema):
    theme: Literal["light", "dark", "system"] | None
    language: Language | None
    notifications_enabled: bool | None