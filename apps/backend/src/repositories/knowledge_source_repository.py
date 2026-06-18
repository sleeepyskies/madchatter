from sqlalchemy import select
from sqlalchemy.orm import Session

from api.api_exception import ResourceNotFoundException
from db.models.knowledge_sources import KnowledgeSource
from models.knowledge import UpdateKnowledgeSourceRequest


class KnowledgeSourceRepository:
    """Provides access to the database for knowledge source related operations."""

    def __init__(self, database: Session):
        self.database = database

    def create(self, source: KnowledgeSource) -> KnowledgeSource:
        self.database.add(source)
        self.database.commit()
        self.database.refresh(source)
        return source

    def get(self, source_id: int) -> KnowledgeSource:
        statement = select(KnowledgeSource).where(KnowledgeSource.id == source_id)
        source = self.database.scalars(statement).first()
        if not source:
            raise ResourceNotFoundException("knowledge_sources", source_id)
        return source

    def list_by_collection(self, collection_id: int) -> list[KnowledgeSource]:
        statement = (
            select(KnowledgeSource).where(KnowledgeSource.vector_collection_id == collection_id))
        return list(self.database.scalars(statement).all())

    def update(self, source_id: int, new: UpdateKnowledgeSourceRequest) -> KnowledgeSource:
        source = self.get(source_id)

        if new.label is not None:
            source.label = new.label

        self.database.commit()
        self.database.refresh(source)
        return source

    def delete(self, source_id: int) -> None:
        source = self.get(source_id)
        self.database.delete(source)
        self.database.commit()
