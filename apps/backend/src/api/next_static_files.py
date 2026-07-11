from starlette.staticfiles import StaticFiles
from starlette.types import Scope
from starlette.responses import Response, FileResponse
from starlette.exceptions import HTTPException

class NextStaticFiles(StaticFiles):
    """
    Handles serving next static files.
    Since Next.js does not generate a single file site, we need more complex routing logic.
    """

    async def get_response(self, path: str, scope: Scope) -> Response:
        try:
            return await super().get_response(path, scope)
        except HTTPException as ex:
            if ex.status_code != 404:
                raise
            for candidate in (f"{path}.html", f"{path}/index.html" if not path.endswith("/") else None):
                if candidate is None:
                    continue
                try:
                    return await super().get_response(candidate, scope)
                except HTTPException as inner:
                    if inner.status_code != 404:
                        raise
            try:
                return await super().get_response("404.html", scope)
            except HTTPException:
                raise ex