from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from api.dependencies import get_project_service
from models.project import ProjectResponse, CreateProjectRequest, UpdateProjectRequest
from services.project_service import ProjectService

PROJECT_PREFIX = "/projects"

router = APIRouter(prefix=PROJECT_PREFIX, tags=["projects"])


@router.post("/", response_model=ProjectResponse)
def create_project(
        request: CreateProjectRequest,
        project_service: ProjectService = Depends(get_project_service),
):
    return project_service.create_project(request)


@router.get("/", response_model=list[ProjectResponse])
def list_projects(
        projects_service: ProjectService = Depends(get_project_service),
):
    return projects_service.list_projects()


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
        project_id: int,
        project_service: ProjectService = Depends(get_project_service),
):
    return project_service.get_project(project_id)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_scene(
        project_id: int,
        request: UpdateProjectRequest,
        scene_service: ProjectService = Depends(get_project_service),
):
    project = scene_service.update_project(project_id, request)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project with id: {} not found".format(project_id)
        )
    return project
