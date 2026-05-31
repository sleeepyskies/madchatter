from models.base import BaseSchema


class AgentResponse(BaseSchema):
    id: int
    label: str
    system_prompt: str


class CreateAgentRequest(BaseSchema):
    label: str
    system_prompt: str



class UpdateAgentRequest(BaseSchema):
    label: str | None
    system_prompt: str | None
