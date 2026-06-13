import uvicorn
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger
from sqlalchemy import Engine
from sqlalchemy.orm import sessionmaker
from starlette import status
from starlette.requests import Request
from starlette.responses import JSONResponse

from api.api_exception import APIException
from api.routes import video_router, project_router, agent_router, knowledge_router, chat_router
from settings import settings

# configure app and state
app = FastAPI(
    title="MadChatter",
    summary="Backend server for the MadChatter application.",
)

app.mount("/static", StaticFiles(directory=settings.static_dir), name="static")
app.mount("/files", StaticFiles(directory=settings.files_dir), name="files")

app.state.SessionLocal = None
app.state.engine = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-User-Text"]  # Show user input text
)

router = APIRouter(prefix=settings.api_prefix)

# link all sub routers
router.include_router(video_router)
router.include_router(project_router)
router.include_router(agent_router)
router.include_router(knowledge_router)
router.include_router(chat_router)


# exception handler
@app.exception_handler(APIException)
async def api_exception_handler(request: Request, exception: APIException) -> JSONResponse:
    logger.error(exception)
    return JSONResponse(
        status_code=exception.status_code,
        content={
            "message": exception.message,
            "code": exception.code,
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception encountered during request processing")

    exception_type = type(exc).__name__
    exception_message = str(exc)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "message": "An unhandled error occurred on the server.",
            "error_type": exception_type,
            "detail": exception_message,
            "path": request.url.path
        }
    )


# connect main router containing all nested routers to app
app.include_router(router)


def start_server(engine: Engine, SessionLocal: sessionmaker):
    """
    Starts the server and injects any dependencies into the application context.

    :param engine: database engine.
    :param SessionLocal: DB session factory.
    :return: None
    """
    logger.info(f"Starting server at {settings.url_string}")

    app.state.engine = engine
    app.state.SessionLocal = SessionLocal

    uvicorn.run(
        "api.server:app",
        host=settings.server_address,
        port=settings.server_port,
        log_config=None,
    )
