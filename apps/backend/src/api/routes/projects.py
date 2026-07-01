from fastapi import APIRouter, Depends, BackgroundTasks
from starlette import status
from starlette.responses import FileResponse

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

@router.get("/{project_id}/export")
def export_project(
        project_id: int,
        background_tasks: BackgroundTasks,
        project_service: ProjectService = Depends(get_project_service),
):
    export = project_service.create_export(project_id)
    background_tasks.add_task(project_service.cleanup_export, export.path)
    return FileResponse(
        path=export.path,
        status_code=status.HTTP_200_OK,
        media_type='application/zip',
        filename=export.name,
    )

@router.post("/import", response_model=ImportProjectReponse)
def import_project(
        project_service: ProjectService = Depends(get_project_service),
):
    return project_service.import_project(ImportProjectRequest())
