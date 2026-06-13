from models.base import BaseSchema


class AgentResponse(BaseSchema):
    id: int
    label: str
    system_prompt: str
    voice_model: str


class CreateAgentRequest(BaseSchema):
    label: str
    system_prompt: str
    voice_model: str


class UpdateAgentRequest(BaseSchema):
    label: str | None = None
    system_prompt: str | None = None
    voice_model: str | None = None
