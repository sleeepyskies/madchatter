from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from models.chat import VideoPreloadResponse, ChatRequest, LatestReplyResponse, ChatModeResponse, ApplyProjectResponse
from services.chat.chat_application_service import ChatApplicationService
from api.dependencies import get_chat_application_service


CHAT_PREFIX = "/chat"

router = APIRouter(prefix=CHAT_PREFIX, tags=["chat"])

@router.post("/apply/{project_id}", response_model=ApplyProjectResponse)
def apply_project(
    project_id: int,
    chat_application_service: ChatApplicationService = Depends(
        get_chat_application_service
    ),
):
    return chat_application_service.apply_project(project_id)


@router.post("/mode", response_model=ChatModeResponse)
def get_chat_mode(
    file: UploadFile = File(...),
    chat_application_service: ChatApplicationService = Depends(
        get_chat_application_service
    ),
):
    return chat_application_service.get_chat_mode(file)

@router.post("/stream_chat", response_class=StreamingResponse)
def stream_chat(
    request: ChatRequest,
    chat_application_service: ChatApplicationService = Depends(
        get_chat_application_service
    ),
):
    return chat_application_service.stream_chat(request.user_text)

@router.get("/latest_reply", response_model=LatestReplyResponse)
def get_latest_reply(
    chat_application_service: ChatApplicationService = Depends(
        get_chat_application_service
    ),
):
    return chat_application_service.get_latest_reply()

@router.get("/preload_videos", response_model=VideoPreloadResponse)
def get_all_videos(
        chat_application_service: ChatApplicationService = Depends(
            get_chat_application_service
        ),
):
    return chat_application_service.get_all_videos()