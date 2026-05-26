from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from api.dependencies import get_scene_service
from models.scene import SceneResponse, CreateSceneRequest, UpdateSceneRequest
from services.scene_service import SceneService

SCENE_PREFIX = "/scenes"

router = APIRouter(prefix=SCENE_PREFIX, tags=["scenes"])


@router.post("/", response_model=SceneResponse)
def create_scene(
        request: CreateSceneRequest,
        scene_service: SceneService = Depends(get_scene_service),
):
    return scene_service.create_scene(request)


@router.get("/", response_model=list[SceneResponse])
def list_scenes(
        scene_service: SceneService = Depends(get_scene_service),
):
    return scene_service.list_scenes()


@router.get("/{scene_id}", response_model=SceneResponse)
def get_scene(
        scene_id: int,
        scene_service: SceneService = Depends(get_scene_service),
):
    return scene_service.get_scene(scene_id)


@router.put("/{scene_id}", response_model=SceneResponse)
def update_scene(
        scene_id: int,
        requst: UpdateSceneRequest,
        scene_service: SceneService = Depends(get_scene_service),
):
    scene = scene_service.update_scene(scene_id, requst)
    if not scene:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Scene with id: {} not found".format(scene_id))
    return scene
