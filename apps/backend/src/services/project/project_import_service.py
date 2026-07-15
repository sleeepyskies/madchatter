import json
import mimetypes
import uuid
import zipfile
from pathlib import Path
from typing import Optional

from fastapi import UploadFile
from starlette.datastructures import Headers
from loguru import logger

from db.models import Project
from models.agent import CreateAgentRequest
from models.knowledge import CreateKnowledgeRequest
from models.project import ImportProjectResponse, UpdateProjectRequest
from models.videos import CreateVideoRequest
from repositories.project_repository import ProjectRepository
from services.agent_service import AgentService
from services.knowledge_service import KnowledgeService
from services.video_service import VideoService
from settings import settings
from util.file_handler import FileHandler


class ProjectImportService:
    def __init__(
            self,
            project_repository: ProjectRepository,
            agent_service: AgentService,
            video_service: VideoService,
            knowledge_service: KnowledgeService,
    ):
        self.file_handler = FileHandler(settings.tmp_dir)
        self.project_repository = project_repository
        self.agent_service = agent_service
        self.video_service = video_service
        self.knowledge_service = knowledge_service

    def import_package(self, file: UploadFile) -> ImportProjectResponse:
        metadata = self._read_metadata_from_zip(file)
        project = self._create_project(metadata)

        scratch_dir = self.file_handler.create_dir(str(project.id))
        created_video_ids: list[int] = []
        knowledge_id: Optional[int] = None

        try:
            file.file.seek(0)
            with zipfile.ZipFile(file.file) as z:
                z.extractall(scratch_dir)

            files_dir = scratch_dir / "files"

            self._load_agent(metadata, project)
            created_video_ids = self._load_videos(metadata, project, files_dir)
            knowledge_id = self._load_knowledge(metadata, project, files_dir)

            self._sync_project(project)

            return ImportProjectResponse(project_id=project.id)

        except Exception:
            logger.exception(f"Import failed for project {project.id}, rolling back")
            self._rollback(project, created_video_ids, knowledge_id)
            raise

        finally:
            self.file_handler.delete_dir(str(project.id))

    def _create_project(self, metadata: dict) -> Project:
        return self.project_repository.create(
            Project(
                label=metadata.get("label"),
                stt_terms=metadata.get("stt_terms"),
                stt_model=metadata.get("stt_model"),
                stt_device=metadata.get("stt_device"),
                llm_model=metadata.get("llm_model")
            )
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

    def _load_videos(self, metadata: dict, project: Project, files_dir: Path) -> list[int]:
        id_map: dict[int, int] = {}  # old video id -> new video id
        created_ids: list[int] = []

        for v in metadata.get("videos", []):
            source_path = files_dir / v["filename"]
            if not source_path.exists():
                logger.warning(f"Video file missing from import package: {source_path}")
                continue

            upload_file = self._as_upload_file(source_path)
            try:
                video = self.video_service.upload_video(
                    CreateVideoRequest(
                        label=v.get("label"),
                        description=v.get("description"),
                        project_id=project.id,
                        includes_audio=v.get("includes_audio", False),
                    ),
                    file=upload_file,
                )
            finally:
                upload_file.file.close()

            id_map[v["id"]] = video.id
            created_ids.append(video.id)

        def resolve(old_id: Optional[int]) -> Optional[int]:
            return id_map.get(old_id) if old_id is not None else None

        project.idle_video_id = resolve(metadata.get("idle_video_id"))
        project.enter_video_id = resolve(metadata.get("enter_video_id"))
        project.exit_video_id = resolve(metadata.get("exit_video_id"))

        return created_ids

    def _as_upload_file(self, source_path: Path) -> UploadFile:
        """Wraps an already-extracted file as an UploadFile so it can go
        through VideoService.upload_video like any normal upload."""
        content_type, _ = mimetypes.guess_type(source_path.name)
        return UploadFile(
            filename=source_path.name,
            file=source_path.open("rb"),
            headers=Headers({"content-type": content_type or "application/octet-stream"}),
        )

    def _load_knowledge(self, metadata: dict, project: Project, files_dir: Path) -> Optional[int]:
        label = metadata.get("knowledge_label")
        if not label:
            return None

        knowledge = self.knowledge_service.create_knowledge(
            CreateKnowledgeRequest(label=label)
        )

        for source in metadata.get("knowledge_sources", []):
            source_path = files_dir / source["filename"]
            if not source_path.exists():
                logger.warning(f"Knowledge source missing from import package: {source_path}")
                continue

            with source_path.open("rb") as f:
                self.knowledge_service.add_source_to_knowledge(
                    knowledge_id=knowledge.id,
                    label=source.get("label"),
                    file=f,
                )

        project.vector_collection_id = knowledge.id
        return knowledge.id

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
                stt_terms=project.stt_terms,
                stt_model=project.stt_model,
                stt_device=project.stt_device,
                llm_model=project.llm_model
            ),
        )

    def _rollback(self, project: Project, video_ids: list[int], knowledge_id: Optional[int]) -> None:
        for video_id in video_ids:
            try:
                self.video_service.delete_video(video_id)
            except Exception:
                logger.exception(f"Failed to roll back video {video_id}")

        if knowledge_id is not None:
            try:
                self.knowledge_service.delete_knowledge(knowledge_id)
            except Exception:
                logger.exception(f"Failed to roll back knowledge {knowledge_id}")

        try:
            self.project_repository.delete(project.id)
        except Exception:
            logger.exception(f"Failed to roll back project {project.id}")

    def _read_metadata_from_zip(self, file: UploadFile) -> dict:
        with zipfile.ZipFile(file.file) as z:
            # sometimes the dir structure is weird, and we need to look deeper, for example on macOS

            matches = [name for name in z.namelist() if name.endswith("metadata.json")]
            if not matches:
                raise FileNotFoundError("metadata.json not found in the archive.")

            # take least nested one
            matches.sort(key=lambda x: x.count('/'))

            with z.open(matches[0]) as f:
                return json.load(f)
