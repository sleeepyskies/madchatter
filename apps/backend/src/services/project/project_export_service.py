import json
import shutil
from pathlib import Path
from typing import Any

from attr import dataclass
from loguru import logger

from repositories.project_repository import ProjectRepository
from repositories.video_repository import VideoRepository
from services.knowledge_service import KnowledgeService
from services.agent_service import AgentService
from settings import settings
from util.file_handler import FileHandler


@dataclass
class ProjectExport:
    zipped_path: str
    project_label: str


class ProjectExportService:
    """
     Service for facilitating the export and import of projects between different installs of MadChatter.
     This handles creating zip files containing all data needed to fully export a project.
     Also, this class handles unpacking zip files and writing the correct data to the db, saving files, and writing to chromadb.

     The file structure of project export files is as follows:
    ```
    /project-name.zip
        metadata.json
        /files
             knowledge1.pdf
             knowledge2.txt
             video1.mp4
             ...
             video5.mp4
    ```
    """

    def __init__(
        self,
        project_repository: ProjectRepository,
        video_repository: VideoRepository,
        knowledge_service: KnowledgeService,
        agent_service: AgentService,
    ):
        self.tmp_dir = settings.tmp_dir
        self.file_handler = FileHandler(self.tmp_dir)
        self.project_repository = project_repository
        self.video_repository = video_repository
        self.knowledge_service = knowledge_service
        self.agent_service = agent_service

    def create_export_package(self, project_id: int) -> ProjectExport:
        """
                Creates a new project Export. An export is described by the class ProjectExport.
                Note that after creating an export, it is saved to disk under /tmp. Once it is no longer needed,
        it should be cleaned up by calling
        todo(sky): add cleanup fn
        """
        project = self.project_repository.get(project_id)

        name = str(project.id)
        path = self.file_handler.create_dir(name)

        # then, collect all relevant file paths for the project
        video_paths = self.collect_videos(project_id)
        knowledge_source_paths = self.collect_knowledge(project_id)

        # then, copy all files into the new directory
        self.copy_files_into(video_paths, path)
        self.copy_files_into(knowledge_source_paths, path)

        # then, write the metadata.json
        metadata = self.create_metadata_json(project_id)
        with open(path / "metadata.json", "w") as f:
            json.dump(metadata, f, indent=4)

        # then, zip the directory
        archive_path = shutil.make_archive(
            base_name=str(path),
            root_dir=path,
            format="zip",
        )

        # remove the unzipped data
        self.file_handler.delete_dir(name)

        # then, return the response
        return ProjectExport(
            zipped_path=archive_path,
            project_label=project.label,
        )

    def collect_videos(self, project_id: int) -> list[Path]:
        project = self.project_repository.get(project_id)
        videos = self.video_repository.list_for_project(project.id)
        return [Path(settings.files_dir / video.filename).absolute() for video in videos]

    def collect_knowledge(self, project_id: int) -> list[Path]:
        project = self.project_repository.get(project_id)
        if project.vector_collection_id is None:
            return []

        return self.knowledge_service.list_knowledge_source_filenames_for_knowledge(project.vector_collection_id)

    def copy_files_into(self, files: list[Path], destination: Path):
        files_dir = destination / "files"
        files_dir.mkdir(parents=True, exist_ok=True)

        for file_path in files:
            if file_path.exists():
                shutil.copy2(file_path, files_dir / file_path.name)
            else:
                logger.warning(f"File not found at {file_path}")

    def create_metadata_json(self, project_id: int) -> dict[str, Any]:
        project = self.project_repository.get(project_id)
        agent = self.agent_service.get_agent(project_id) if (project.agent_id is not None) else None
        videos = self.video_repository.list_for_project(project_id)
        sources = self.knowledge_service.list_knowledge_source_db_for_knowledge(project.vector_collection_id) if project.vector_collection_id is not None else []
        knowledge = self.knowledge_service.get_knowledge(project.vector_collection_id) if project.vector_collection_id is not None else None

        agent_data = None
        if agent is not None:
            agent_data = {
                "label": agent.label,
                "system_prompt": agent.system_prompt,
                "language": agent.language,
                "voice_model": agent.voice_model,
            }

        return {
            "label": project.label,
            "idle_video_id": project.idle_video_id,
            "enter_video_id": project.enter_video_id,
            "exit_video_id": project.exit_video_id,
            "stt_terms": project.stt_terms,
            "stt_model": project.stt_model,
            "stt_device": project.stt_device,
            "llm_model": project.llm_model,
            "agent": agent_data,
            "knowledge_label": knowledge.label if knowledge is not None else None,
            "knowledge_sources": [
                {
                    "label": source.label,
                    "filename": source.filename,
                } for source in sources
            ],
            "videos": [
                {
                    "id": v.id,
                    "label": v.label,
                    "description": v.description,
                    "filename": v.filename,
                    "includes_audio": v.includes_audio,
                } for v in videos
            ],
        }

    def cleanup_export(self, project_id: int):
        filename = f"{project_id}.zip"
        logger.info(f"Cleaning up {filename}")
        self.file_handler.delete_file(filename)


