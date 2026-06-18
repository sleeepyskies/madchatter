from models.base import BaseSchema


class CreateKnowledgeRequest(BaseSchema):
    label: str


class CreateKnowledgeSourceRequest(BaseSchema):
    label: str


class KnowledgeSourceResponse(BaseSchema):
    id: int
    label: str
    download_url: str

class UpdateKnowledgeSourceRequest(BaseSchema):
    label: str | None

class KnowledgeResponse(BaseSchema):
    id: int
    label: str
    sources: list[KnowledgeSourceResponse]
