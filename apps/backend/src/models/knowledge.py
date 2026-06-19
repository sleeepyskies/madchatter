from models.base import BaseSchema


class KnowledgeSourceResponse(BaseSchema):
    id: int
    label: str
    download_url: str


class UpdateKnowledgeSourceRequest(BaseSchema):
    label: str | None = None


class KnowledgeResponse(BaseSchema):
    id: int
    label: str
    sources: list[KnowledgeSourceResponse]


class CreateKnowledgeRequest(BaseSchema):
    label: str


class UpdateKnowledgeRequest(BaseSchema):
    label: str | None = None
