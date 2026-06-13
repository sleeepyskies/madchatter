from models.base import BaseSchema


class CreateKnowledgeRequest(BaseSchema):
    label: str


class CreateKnowledgeSourceRequest(BaseSchema):
    label: str


class KnowledgeSourceResponse(BaseSchema):
    id: int
    label: str
    download_url: str


class KnowledgeResponse(BaseSchema):
    id: int
    label: str
    sources: list[KnowledgeSourceResponse]
