import uvicorn
from fastapi import FastAPI, APIRouter
from loguru import logger
from sqlalchemy import Engine
from sqlalchemy.orm import sessionmaker

from api.routes import video_router
from settings import Settings

API_PREFIX = "/api"

# configure app and state
app = FastAPI()
app.state.SessionLocal = None
app.state.engine = None

router = APIRouter(prefix=API_PREFIX)

router.include_router(video_router)
# router.include_router(example_router)
# router.include_router(example_router)
# add more routers here...

# connect main router containing all nested routers to app
app.include_router(router)


def start_server(settings: Settings, engine: Engine, SessionLocal: sessionmaker):
    """
    Starts the server and injects any dependencies into the application context.

    :param settings: app configuration.
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
