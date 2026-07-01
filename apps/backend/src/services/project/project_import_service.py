import json
import shutil
import uuid
import zipfile
from pathlib import Path
from typing import Optional

from fastapi import UploadFile
from loguru import logger

from db.models import Project, Video
from models.agent import CreateAgentRequest
from models.knowledge import CreateKnowledgeRequest
from models.project import ImportProjectResponse, UpdateProjectRequest
from repositories.project_repository import ProjectRepository
from repositories.video_repository import VideoRepository
from services.agent_service import AgentService
from services.knowledge_service import KnowledgeService
from settings import settings
from util.file_handler import FileHandler


class ProjectImportService:
    def __init__(
            self,
            project_repository: ProjectRepository,
            agent_service: AgentService,
            video_repository: VideoRepository,
            knowledge_service: KnowledgeService,
    ):
        self.file_handler = FileHandler(settings.tmp_dir)
        self.project_repository = project_repository
        self.agent_service = agent_service
        self.video_repository = video_repository
        self.knowledge_service = knowledge_service

    # -------------------------
    # PUBLIC API
    # -------------------------
    def import_package(self, file: UploadFile) -> ImportProjectResponse:
        extract_dir_name = uuid.uuid4().hex
        package_path = self._extract_package(file, extract_dir_name)

        try:
            metadata = self._load_metadata(package_path)
            files_dir = package_path / "files"

            project = self._create_project(metadata)

            self._load_agent(metadata, project)
            self._load_videos(metadata, project, files_dir)
            self._load_knowledge(metadata, project, files_dir)

            self._sync_project(project)

            return ImportProjectResponse(project_id=project.id)
        finally:
            # extracted zip contents are no longer needed once files are copied into storage
            self.file_handler.delete_dir(extract_dir_name)

    # -------------------------
    # CORE
    # -------------------------
    def _create_project(self, metadata: dict) -> Project:
        return self.project_repository.create(
            Project(label=metadata.get("label"))
        )

    def _load_agent(self, metadata: dict, project: Project) -> None:
        agent = metadata.get("agent")
        if not agent:
            return

        created = self.agent_service.create_agent(
            CreateAgentRequest(
                label=agent.get("label"),
                system_prompt=agent.get("system_prompt"),
                language=agent.get("language"),
                voice_model=agent.get("voice_model"),
            )
        )

        project.agent_id = created.id

    # -------------------------
    # VIDEOS (UUID STORAGE)
    # -------------------------
    def _load_videos(self, metadata: dict, project: Project, files_dir: Path) -> None:
        id_map: dict[int, Video] = {}

        storage_dir = self.file_handler.directory / "videos"
        storage_dir.mkdir(parents=True, exist_ok=True)

        for v in metadata.get("videos", []):
            # the old (exported) uuid filename is what's on disk in the package;
            # a brand-new uuid filename is generated for local storage
            source_path = files_dir / v["filename"]
            if not source_path.exists():
                logger.warning(f"Video file missing from import package: {source_path}")
                continue

            new_path = self._copy_with_new_filename(source_path, storage_dir)

            video = self.video_repository.create(
                Video(
                    label=v.get("label"),
                    description=v.get("description"),
                    filename=new_path.name,
                    includes_audio=v.get("includes_audio", False),
                    project_id=project.id,
                )
            )
            id_map[v["id"]] = video

        def resolve(old_id: Optional[int]) -> Optional[int]:
            if old_id is None:
                return None
            video = id_map.get(old_id)
            return video.id if video else None

        project.idle_video_id = resolve(metadata.get("idle_video_id"))
        project.enter_video_id = resolve(metadata.get("enter_video_id"))
        project.exit_video_id = resolve(metadata.get("exit_video_id"))

    # -------------------------
    # KNOWLEDGE (UUID SOURCES)
    # -------------------------
    def _load_knowledge(self, metadata: dict, project: Project, files_dir: Path) -> None:
        label = metadata.get("knowledge_label")
        if not label:
            return

        storage_dir = self.file_handler.directory / "sources"
        storage_dir.mkdir(parents=True, exist_ok=True)

        knowledge = self.knowledge_service.create_knowledge(
            CreateKnowledgeRequest(label=label)
        )

        for source in metadata.get("knowledge_sources", []):
            source_path = files_dir / source["filename"]
            if not source_path.exists():
                logger.warning(f"Knowledge source missing from import package: {source_path}")
                continue

            new_path = self._copy_with_new_filename(source_path, storage_dir)

            with new_path.open("rb") as f:
                self.knowledge_service.add_source_to_knowledge(
                    knowledge_id=knowledge.id,
                    label=source.get("label"),
                    file=f,
                )

        project.vector_collection_id = knowledge.id

    # -------------------------
    # SYNC
    # -------------------------
    def _sync_project(self, project: Project) -> None:
        self.project_repository.update(
            project.id,
            UpdateProjectRequest(
                label=project.label,
                agent_id=project.agent_id,
                knowledge_id=project.vector_collection_id,
                idle_video_id=project.idle_video_id,
                enter_video_id=project.enter_video_id,
                exit_video_id=project.exit_video_id,
            ),
        )

    # -------------------------
    # UTILS
    # -------------------------
    def _extract_package(self, file: UploadFile, dir_name: str) -> Path:
        package_path = self.file_handler.create_dir(dir_name)
        with zipfile.ZipFile(file.file) as z:
            z.extractall(package_path)
        return package_path

    def _load_metadata(self, package_path: Path) -> dict:
        with open(package_path / "metadata.json", "r", encoding="utf-8") as f:
            return json.load(f)

    def _copy_with_new_filename(self, source_path: Path, storage_dir: Path) -> Path:
        """Copies a file from the extracted import package into permanent storage
        under a freshly generated uuid filename, preserving the original extension."""
        new_filename = f"{uuid.uuid4().hex}{source_path.suffix}"
        target_path = storage_dir / new_filename
        shutil.copy2(source_path, target_path)
        return target_path
