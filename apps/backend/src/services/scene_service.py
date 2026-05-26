from db.models.scenes import Scene
from models.scene import CreateSceneRequest, SceneResponse, UpdateSceneRequest
from repositories.scene_repository import SceneRepository, UpdateScene
from repositories.video_repository import VideoRepository


class SceneService:
    """Handles scene related business logic."""

    def __init__(self, scene_repository: SceneRepository, video_repository: VideoRepository):
        self.scene_repository = scene_repository
        self.video_repository = video_repository

    def create_scene(self, request: CreateSceneRequest) -> SceneResponse:
        videos = []

        if request.video_ids:
            # todo: not the most efficient here as we first get every single video and then filter
            videos = list(
                filter(
                    lambda v: v.id in request.video_ids,
                    self.video_repository.list()
                )
            )

        scene = self.scene_repository.create(Scene(
            label=request.label,
            agent_id=request.agent_id,
            videos=videos,
        ))

        return SceneResponse(
            id=scene.id,
            label=scene.label,
            agent_id=scene.agent_id,
            video_ids=[v.id for v in scene.videos],
        )

    def get_scene(self, scene_id: int) -> SceneResponse | None:
        scene = self.scene_repository.get(scene_id)
        if not scene:
            return None
        return SceneResponse(
            id=scene.id,
            label=scene.label,
            agent_id=scene.agent_id,
            video_ids=[video.id for video in scene.videos],
        )

    def list_scenes(self) -> list[SceneResponse]:
        scenes = self.scene_repository.list()
        return [SceneResponse(
            id=s.id,
            label=s.label,
            agent_id=s.agent_id,
            video_ids=[video.id for video in s.videos],
        ) for s in scenes]

    def update_scene(self, scene_id: int, request: UpdateSceneRequest) -> SceneResponse | None:
        scene = self.scene_repository.update(scene_id, UpdateScene(
            label=request.label,
            agent_id=request.agent_id,
            video_ids=request.video_ids,
        ))

        if not scene:
            return None
        return SceneResponse(
            id=scene.id,
            label=scene.label,
            agent_id=scene.agent_id,
            video_ids=[video.id for video in scene.videos],
        )

    def delete_scene(self, scene_id: int) -> bool:
        video = self.scene_repository.get(scene_id)
        if not video:
            return False
        return self.scene_repository.delete(scene_id)
