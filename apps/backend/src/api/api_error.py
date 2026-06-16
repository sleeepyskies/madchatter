from starlette.responses import JSONResponse

from models.base import BaseSchema


class ApiError(JSONResponse):
    def __init__(
            self,
            code: int,
            error_type: str,
            path: str,
            message: str,
            detail: str
    ):
        super().__init__(
            status_code=code,
            content={
                "code": code,
                "type": error_type,
                "path": path,
                "message": message,
                "detail": detail,
            }
        )

