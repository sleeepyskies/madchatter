from starlette import status


class APIException(Exception):
    """
    Base API Exception class.
    All exception classes should extend this class, as the API will then automatically
    handle responses of this type.
    :param status_code: HTTP status code.
    :param code: Human-readable error code.
    :param message: Human-readable error message.
    """

    def __init__(self, status_code: int, code: str, message: str):
        self.status_code = status_code
        self.code = code
        self.message = message


class ResourceNotFoundException(APIException):
    """
    Exception raised when a resource does not exist.
    """

    def __init__(self, resource: str, resource_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="RESOURCE_NOT_FOUND",
            message=f"{resource} with id {resource_id} not found",
        )
        self.resource = resource
        self.resource_id = resource_id


class InvalidFileException(APIException):
    """
    Exception raised when an invalid file exists.
    """

    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="INVALID_FILE",
            message=message,
        )


class InvalidArgumentException(APIException):
    """
    Exception raised when an invalid argument is passed into a function.
    """

    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="INVALID_ARGUMENT",
            message=message,
        )
