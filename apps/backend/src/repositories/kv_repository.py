from enum import Enum

from sqlalchemy import select
from sqlalchemy.orm import Session

from db.models.kv_store import KvStore

class Theme(Enum):
    LIGHT = "light"
    DARK = "dark"

class KVRepository:
    """
    Key Value Repository. Enforces certain key value pairs that can be inserted.
    """

    def __init__(self, database: Session):
        self.database = database

    def get_string(self, key: str) -> str | None:
        statement = select(KvStore).where(KvStore.key == key)
        result = self.database.scalars(statement).first()
        return result.value if result else None

    def set_string(self, key: str, value: str) -> None:
        statement = select(KvStore).where(KvStore.key == key)
        kv = self.database.scalars(statement).first()

        if kv:
            kv.value = value
        else:
            kv = KvStore(key=key, value=value)
            self.database.add(kv)

        self.database.commit()

    def get_active_project_id(self) -> int | None:
        val = self.get_string("active_project_id")
        return int(val) if val is not None else None

    def set_active_project_id(self, project_id: int) -> None:
        self.set_string("active_project_id", str(project_id))

    def get_theme(self) -> Theme:
        val = self.get_string("theme")
        try:
            return Theme(val) if val else Theme.LIGHT
        except ValueError:
            return Theme.LIGHT

    def set_theme(self, theme: Theme) -> None:
        self.set_string("theme", theme.value)
