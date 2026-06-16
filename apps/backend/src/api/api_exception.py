from starlette import status


class APIException(Exception):
    """
    Base API Exception class.
    All exception classes should extend this class, as the API will then automatically
    handle responses of this type.
    :param status_code: HTTP status code.
    :param error_type: Human-readable error code.
    :param message: Human-readable error message.
    :param detail: Human-readable error detail.
    """

    def __init__(self, status_code: int, error_type: str, message: str, detail: str):
        self.status_code = status_code
        self.error_type = error_type
        self.message = message
        self.detail = detail


class ResourceNotFoundException(APIException):
    """
    Exception raised when a resource does not exist.
    """

    def __init__(self, resource: str, resource_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            error_type="RESOURCE_NOT_FOUND",
            message="A requested resource does not exist",
            detail=f"{resource} with id {resource_id} not found",
        )
        self.resource = resource
        self.resource_id = resource_id


class InvalidFileException(APIException):
    """
    Exception raised when an invalid file exists.
    """

    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_type="INVALID_FILE",
            message="An invalid file was found on the backend",
            detail=detail,
        )


class InvalidArgumentException(APIException):
    """
    Exception raised when an invalid argument is passed into a function.
    """

    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_type="INVALID_ARGUMENT",
            message="An invalid function argument was passed",
            detail=detail,
        )
