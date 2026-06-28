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


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
        project_id: int,
        request: UpdateProjectRequest,
        project_service: ProjectService = Depends(get_project_service),
):
    return project_service.update_project(project_id, request)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
        project_id: int,
        project_service: ProjectService = Depends(get_project_service),
):
    project_service.delete_project(project_id)

@router.get("/{project_id}/export", reponse_model=ExportProjectResponse)
def export_project(
        project_id: int,
        project_service: ProjectService = Depends(get_project_service),
):
    return project_service.export_project(project_id)

@router.post("/import", response_model=ImportProjectReponse)
def import_project(
        project_service: ProjectService = Depends(get_project_service),
):
    return project_service.import_project(ImportProjectRequest())
