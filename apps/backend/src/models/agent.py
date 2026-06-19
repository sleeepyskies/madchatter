from enum import Enum

from models.base import BaseSchema


class Language(str, Enum):
    DE = "DE"
    EN = "EN"


class AgentResponse(BaseSchema):
    id: int
    label: str
    system_prompt: str
    language: Language
    voice_model: str


class CreateAgentRequest(BaseSchema):
    label: str
    system_prompt: str
    language: Language
    voice_model: str


class UpdateAgentRequest(BaseSchema):
    label: str | None = None
    system_prompt: str | None = None
    language: Language | None = None
    voice_model: str | None = None
