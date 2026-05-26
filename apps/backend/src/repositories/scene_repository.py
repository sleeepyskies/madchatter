from dataclasses import dataclass

from sqlalchemy import select, delete
from sqlalchemy.orm import Session

from db.models.scenes import Scene


@dataclass
class UpdateScene:
    label: str | None
    agent_id: int | None
    video_ids: list[int] | None


class SceneRepository:
    """Provides access to the database for any Scene related operations."""

    def __init__(self, database: Session):
        self.database = database

    def create(self, scene: Scene) -> Scene:
        self.database.add(scene)
        self.database.commit()
        self.database.refresh(scene)
        return scene

    def get(self, scene_id: int) -> Scene | None:
        return self.database.get(Scene, scene_id)

    def list(self) -> list[Scene]:
        return list(self.database.scalars(select(Scene)).all())

    def update(self, scene_id: int, new: UpdateScene) -> Scene | None:
        scene = self.get(scene_id)

        if not scene:
            return None

        if new.agent_id is not None:
            scene.agent_id = new.agent_id
        if new.label is not None:
            scene.label = new.label
        if new.video_ids is not None:
            scene.video_ids = new.video_ids

        self.database.commit()
        self.database.refresh(scene)
        return scene

    def delete(self, scene_id: int) -> bool:
        result = self.database.execute(
            delete(Scene).where(Scene.id == scene_id)
        )
        self.database.commit()
        return result.rowcount > 0
