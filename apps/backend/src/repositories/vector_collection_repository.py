from sqlalchemy import select
from sqlalchemy.orm import Session

from api.api_exception import ResourceNotFoundException
from db.models.vector_collections import VectorCollection
from models.knowledge import UpdateKnowledgeRequest


class VectorCollectionRepository:
    """Provides access to the database for vector collection related operations."""

    def __init__(self, database: Session):
        self.database = database

    def create(self, collection: VectorCollection) -> VectorCollection:
        self.database.add(collection)
        self.database.commit()
        self.database.refresh(collection)
        return collection

    def get(self, source_id: int) -> VectorCollection:
        statement = select(VectorCollection).where(VectorCollection.id == source_id)
        source = self.database.scalars(statement).first()
        if not source:
            raise ResourceNotFoundException("vector_collections", source_id)
        return source

    def list(self) -> list[VectorCollection]:
        statement = select(VectorCollection)
        return list(self.database.scalars(statement).all())

    def update(self, collection_id: int, new: UpdateKnowledgeRequest) -> VectorCollection:
        collection = self.get(collection_id)

        if new.label is not None:
            collection.label = new.label

        self.database.commit()
        self.database.refresh(collection)
        return collection

    def delete(self, collection_id: int) -> None:
        collection = self.get(collection_id)
        self.database.delete(collection)
        self.database.commit()
