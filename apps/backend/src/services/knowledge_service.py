import uuid
from io import BufferedReader
from pathlib import Path
from typing import BinaryIO

from fastapi import UploadFile

from api.api_exception import InvalidArgumentException
from db.models.knowledge_sources import KnowledgeSource
from db.models.vector_collections import VectorCollection
from models.knowledge import (
	CreateKnowledgeRequest,
	KnowledgeResponse,
	KnowledgeSourceResponse,
	UpdateKnowledgeSourceRequest,
	UpdateKnowledgeRequest,
)
from repositories.knowledge_base_repository import KnowledgeBase
from repositories.knowledge_source_repository import KnowledgeSourceRepository
from repositories.vector_collection_repository import VectorCollectionRepository
from settings import settings
from util.download_url import create_download_url
from util.file_handler import FileHandler


def create_unique_filename(filename: str) -> str:
	if not filename:
		raise InvalidArgumentException("File must have a name to identify the extension.")
	ext = Path(filename).suffix
	return f"{uuid.uuid4().hex}{ext}"


class KnowledgeService:
	"""
	Handles knowledge base related business logic.
	"""

	def __init__(
		self,
		knowledge_source_repository: KnowledgeSourceRepository,
		vector_collection_repository: VectorCollectionRepository,
	):
		self.knowledge_source = knowledge_source_repository
		self.vector_collection = vector_collection_repository
		self.file_handler = FileHandler(settings.files_dir)

	def create_knowledge(self, request: CreateKnowledgeRequest) -> KnowledgeResponse:
		"""
		Creates a new knowledge base. This means instantiating a new ChromaDB collection, as well
		as creating a new vector collection referencing this.
		"""

		# generate some name for chroma collection
		chroma_collection_name = uuid.uuid4().hex

		# then associate it with our sql db, this will fail if not unique
		collection = self.vector_collection.create(
			VectorCollection(label=request.label, chroma_collection=chroma_collection_name)
		)

		KnowledgeBase(chroma_collection_name)

		return KnowledgeResponse(
			id=collection.id,
			label=collection.label,
			sources=[],
		)

	def list_knowledge(self) -> list[KnowledgeResponse]:
		"""Simply lists all ids and labels of knowledge bases."""

		return [
			KnowledgeResponse(
				id=collection.id,
				label=collection.label,
				sources=self.list_knowledge_sources_for_knowledge(collection.id),
			)
			for collection in self.vector_collection.list()
		]

	def get_knowledge(self, knowledge_id: int) -> KnowledgeResponse:
		"""Returns the id and label of a knowledge base."""

		knowledge = self.vector_collection.get(knowledge_id)
		return KnowledgeResponse(
			id=knowledge.id,
			label=knowledge.label,
			sources=self.list_knowledge_sources_for_knowledge(knowledge_id),
		)

	def list_knowledge_sources_for_knowledge(self, knowledge_id: int) -> list[KnowledgeSourceResponse]:
		"""Returns a list of all knowledge sources associated with a knowledge base."""

		return [
			KnowledgeSourceResponse(id=source.id, label=source.label, download_url=create_download_url(source.filename))
			for source in self.knowledge_source.list_by_collection(knowledge_id)
		]

	def list_knowledge_source_filenames_for_knowledge(self, knowledge_id: int) -> list[Path]:
		return [
			Path(settings.files_dir / source.filename).absolute()
			for source in self.knowledge_source.list_by_collection(knowledge_id)
		]

	def list_knowledge_source_db_for_knowledge(self, knowledge_id: int) -> list[KnowledgeSource]:
		return [
			self.knowledge_source.get(source.id)
			for source in self.knowledge_source.list_by_collection(knowledge_id)
		]

	def delete_knowledge(self, knowledge_id: int) -> None:
		"""Deletes a whole knowledge base along with any related data."""

		collection = self.vector_collection.get(knowledge_id)
		knowledge_base = KnowledgeBase(collection.chroma_collection)
		sources = self.knowledge_source.list_by_collection(knowledge_id)

		# delete all source files from disk
		# delete all rows in knowledge_sources
		for source in sources:
			self.file_handler.delete_file(source.filename)
			self.knowledge_source.delete(source.id)

		# delete vector_collections entry
		self.vector_collection.delete(collection.id)

		# erase the chroma db data
		knowledge_base.erase_collection()

	def update_knowledge(self, knowledge_id: int, request: UpdateKnowledgeRequest) -> KnowledgeResponse:
		self.vector_collection.update(knowledge_id, request)
		return self.get_knowledge(knowledge_id)

	def add_source_to_knowledge(
			self,
			knowledge_id: int,
			label: str,
			file: UploadFile | BufferedReader,
	) -> KnowledgeSourceResponse:
		collection = self.vector_collection.get(knowledge_id)

		stream = file.file if isinstance(file, UploadFile) else file
		original_name = getattr(file, "filename", getattr(file, "name", "source"))
		unique_filename = create_unique_filename(original_name)

		path = self.file_handler.save_file(stream, unique_filename)

		knowledge_base = KnowledgeBase(collection.chroma_collection)
		documents = knowledge_base.add_file(path)

		source = self.knowledge_source.create(
			KnowledgeSource(
				label=label,
				vector_collection_id=collection.id,
				filename=unique_filename,
				documents=documents,
			)
		)

		return KnowledgeSourceResponse(
			id=source.id,
			label=source.label,
			download_url=create_download_url(unique_filename),
		)

	def remove_source_from_knowledge(self, knowledge_id: int, source_id: int) -> None:
		"""Removes a source from the knowledge base."""

		source = self.knowledge_source.get(source_id)
		collection = self.vector_collection.get(knowledge_id)
		knowledge_base = KnowledgeBase(collection.chroma_collection)
		knowledge_base.delete_documents(source.documents)

		self.file_handler.delete_file(source.filename)
		self.knowledge_source.delete(source.id)

	def fetch_knowledge_base(self, knowledge_id: int) -> str:
		collection = self.vector_collection.get(knowledge_id)
		return collection.chroma_collection

	def update_source(self, source_id: int, request: UpdateKnowledgeSourceRequest) -> KnowledgeSourceResponse:
		source = self.knowledge_source.update(source_id, request)
		return KnowledgeSourceResponse(
			id=source.id,
			label=source.label,
			download_url=create_download_url(source.filename),
		)
