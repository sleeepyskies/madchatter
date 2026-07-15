import socket

import uvicorn
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger
from sqlalchemy import Engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker
from starlette import status
from starlette.requests import Request
from starlette.responses import JSONResponse
import mimetypes

from api.api_exception import APIException, ApiErrorResponse
from api.next_static_files import NextStaticFiles
from api.routes import video_router, project_router, agent_router, knowledge_router, chat_router
from settings import settings


def create_app() -> FastAPI:
    mimetypes.add_type("application/javascript", ".mjs")
    mimetypes.add_type("application/wasm", ".wasm")

    # dont mount doc pages in prod builds
    return FastAPI(
        title="MadChatter",
        summary="Backend server for the MadChatter application.",
        **(
            {
                "openapi_url": None,
                "docs_url": None,
                "redoc_url": None,
            }
            if settings.is_production
            else {}
        ),
    )


def init_app_state(app: FastAPI, engine: Engine, SessionLocal: sessionmaker) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-User-Text"],  # Show user input text
    )
    app.state.SessionLocal = SessionLocal
    app.state.engine = engine


def setup_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(APIException)
    async def api_exception_handler(request: Request, exception: APIException) -> JSONResponse:
        logger.error(exception)

        return ApiErrorResponse(
            code=exception.status_code,
            error_type=exception.error_type,
            path=request.url.path,
            message=exception.message,
            detail=exception.detail,
        )

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(request: Request, exception: IntegrityError):
        logger.error(exception)

        msg = str(exception.orig)
        detail = ""
        if "FOREIGN KEY" in msg:
            detail = "The resource referenced through a foreign key does not exist."
        elif "UNIQUE" in msg:
            detail = "A resource with this unique value already exists."
        elif "NOT NULL" in msg:
            detail = "A required field was missing or left empty."

        return ApiErrorResponse(
            code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_type="ValidationError",
            path=request.url.path,
            message="Database integrity was violated.",
            detail=detail,
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception encountered during request processing")

        exception_type = type(exc).__name__
        exception_message = str(exc)

        return ApiErrorResponse(
            code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_type=exception_type,
            path=request.url.path,
            message=exception_message,
            detail=exception_message,
        )


def attach_routers(app) -> None:
    router = APIRouter(prefix=settings.api_prefix)

    router.include_router(video_router)
    router.include_router(project_router)
    router.include_router(agent_router)
    router.include_router(knowledge_router)
    router.include_router(chat_router)

    app.include_router(router)


def attach_static_files(app) -> None:
    app.mount("/static", StaticFiles(directory=settings.static_dir), name="static")
    app.mount("/files", StaticFiles(directory=settings.files_dir), name="files")

    # must be after other mounts to avoid consuming all requests
    if settings.is_production:
        app.mount("/", NextStaticFiles(directory=settings.frontend_dir, html=True), name="frontend")


def find_server_port(preferred: int) -> int:
    """
    Attempts to find a suitable server port.
    If the preferred port is taken, the OS will decide which port to run on.
    """
    if not settings.is_production:
        return settings.server_port

    for port in (preferred, 0):
        with socket.socket() as s:
            try:
                s.bind((settings.server_address, port))
                return s.getsockname()[1]
            except OSError:
                pass


def start_server(engine: Engine, SessionLocal: sessionmaker):
    """
    Starts the server and injects any dependencies into the application context.

    :param engine: database engine.
    :param SessionLocal: DB session factory.
    :return: None
    """
    app = create_app()
    init_app_state(app, engine, SessionLocal)
    setup_exception_handlers(app)
    attach_routers(app)
    attach_static_files(app)

    port = find_server_port(settings.server_port)
    if port != settings.server_port:
        settings.server_port = port
        logger.warning(f"Could not use the preferred port. OS chose port {port} to run on.")

    if settings.is_production:
        import webbrowser
        logger.info(f"Webapp can be viewed under {settings.webapp_url}")
        webbrowser.open(settings.webapp_url)

    uvicorn.run(
        app,
        host=settings.server_address,
        port=port,
        log_config=None,
    )
