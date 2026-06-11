import os
import uvicorn
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger
from sqlalchemy import Engine
from sqlalchemy.orm import sessionmaker
from starlette.requests import Request
from starlette.responses import JSONResponse

from api.api_exception import APIException
from api.routes import video_router, project_router, agent_router, preference_router, chat_router
from settings import settings

API_PREFIX = "/api"

# configure app and state
app = FastAPI(
    title="MadChatter",
    summary="Backend server for the MadChatter application.",
)

# Use absolute paths for static file directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIC_DIR = os.path.join(BASE_DIR, "static")
VIDEOS_DIR = os.path.join(BASE_DIR, "videos")

# Ensure directories exist
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(VIDEOS_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.mount("/videos", StaticFiles(directory=VIDEOS_DIR), name="videos")

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

router = APIRouter(prefix=API_PREFIX)

# link all sub routers
router.include_router(video_router)
router.include_router(project_router)
router.include_router(agent_router)
router.include_router(preference_router)
router.include_router(chat_router)


# exception handler
@app.exception_handler(APIException)
async def handler(request: Request, exception: APIException) -> JSONResponse:
    logger.error(exception)
    return JSONResponse(
        status_code=exception.status_code,
        content={
            "message": exception.message,
            "code": exception.code,
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
    logger.info(f"Starting server at http://{settings.server_address}:{settings.server_port}")
    logger.info(f"Docs: http://{settings.server_address}:{settings.server_port}/docs")

    app.state.engine = engine
    app.state.SessionLocal = SessionLocal

    uvicorn.run(
        "api.server:app",
        host=settings.server_address,
        port=settings.server_port,
        log_config=None,
    )
