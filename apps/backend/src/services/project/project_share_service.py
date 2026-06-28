class ProjectExport:
	pass


class ProjectShareService:
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
	):
        self.project_repository = project_repository


    def create_export_package(project_id: int) -> ProjectExport:
		pass


	def import_project_package(package: ZippedProject) -> int:
		pass

