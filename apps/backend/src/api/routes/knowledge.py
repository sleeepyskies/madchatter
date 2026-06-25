from fastapi import APIRouter, Depends, UploadFile, File, Form
from starlette import status

from api.dependencies import get_knowledge_service
from models.knowledge import KnowledgeResponse, CreateKnowledgeRequest, KnowledgeSourceResponse, \
    UpdateKnowledgeSourceRequest, UpdateKnowledgeRequest
from services.knowledge_service import KnowledgeService

KNOWLEDGE_PREFIX = "/knowledge"

router = APIRouter(prefix=KNOWLEDGE_PREFIX, tags=["knowledge"])


@router.post("", response_model=KnowledgeResponse)
def create_knowledge(
        request: CreateKnowledgeRequest,
        knowledge_service: KnowledgeService = Depends(get_knowledge_service),
):
    return knowledge_service.create_knowledge(request)


@router.get("", response_model=list[KnowledgeResponse])
def list_knowledge(knowledge_service: KnowledgeService = Depends(get_knowledge_service)):
    return knowledge_service.list_knowledge()


@router.get("/{knowledge_id}", response_model=KnowledgeResponse)
def get_knowledge(
        knowledge_id: int,
        knowledge_service: KnowledgeService = Depends(get_knowledge_service),
):
    return knowledge_service.get_knowledge(knowledge_id)


@router.get("/{knowledge_id}/sources", response_model=list[KnowledgeSourceResponse])
def list_knowledge_sources_for_knowledge(
        knowledge_id: int,
        knowledge_service: KnowledgeService = Depends(get_knowledge_service),
):
    return knowledge_service.list_knowledge_sources_for_knowledge(knowledge_id)


@router.delete("/{knowledge_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_knowledge(
        knowledge_id: int,
        knowledge_service: KnowledgeService = Depends(get_knowledge_service),
):
    knowledge_service.delete_knowledge(knowledge_id)

@router.patch("/{knowledge_id}", response_model=KnowledgeResponse)
def update_knowledge(
        knowledge_id: int,
        request: UpdateKnowledgeRequest,
        knowledge_service: KnowledgeService = Depends(get_knowledge_service),
):
    return knowledge_service.update_knowledge(knowledge_id, request)


@router.patch("/{knowledge_id}/sources", response_model=KnowledgeSourceResponse)
def add_source_to_knowledge(
        knowledge_id: int,
        label: str = Form(...),
        file: UploadFile = File(...),
        knowledge_service: KnowledgeService = Depends(get_knowledge_service),
):
    return knowledge_service.add_source_to_knowledge(knowledge_id, label, file)


@router.delete("/{knowledge_id}/sources/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_source_from_knowledge(
        knowledge_id: int,
        source_id: int,
        knowledge_service: KnowledgeService = Depends(get_knowledge_service),
):
    knowledge_service.remove_source_from_knowledge(knowledge_id, source_id)

@router.patch("/sources/{source_id}", response_model=KnowledgeSourceResponse)
def update_source(
        source_id: int,
        request: UpdateKnowledgeSourceRequest,
        knowledge_service: KnowledgeService = Depends(get_knowledge_service),
):
    return knowledge_service.update_source(source_id, request)
