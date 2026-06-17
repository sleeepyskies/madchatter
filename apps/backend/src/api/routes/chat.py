from fastapi import APIRouter, Depends, UploadFile, File

from services.chat.chat_application_service import ChatApplicationService
from api.dependencies import get_chat_application_service


CHAT_PREFIX = "/chat"

router = APIRouter(prefix=CHAT_PREFIX, tags=["chat"])

@router.post("/apply/{project_id}")
def apply_project(
    project_id: int,
    chat_application_service: ChatApplicationService = Depends(
        get_chat_application_service
    ),
):
    chat_application_service.apply_project(project_id)

    return {"message": "ok", "project_id": project_id}

@router.post("/")
def chat(
    file: UploadFile = File(...),
    chat_application_service: ChatApplicationService = Depends(
        get_chat_application_service
    ),
):
    return chat_application_service.chat(file)

@router.get("/latest_reply")
def get_latest_reply(
    chat_application_service: ChatApplicationService = Depends(
        get_chat_application_service
    ),
):
    return {
        "reply": chat_application_service.get_latest_reply()
    }