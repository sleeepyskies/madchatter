from pathlib import Path

from sqlalchemy import create_engine, Engine
from sqlalchemy.orm import sessionmaker

from db.base import Base
from settings import Settings, settings
from loguru import logger


def load_database() -> tuple[Engine, sessionmaker]:
    """
    Connects to the database configured in settings.
    :return: SQLAlchemy engine object.
    """

    logger.info("Connecting to database...")

    try:
        if settings.database_url.startswith("sqlite"):
            db_path = settings.database_url.replace("sqlite:///", "")
            Path(db_path).parent.mkdir(parents=True, exist_ok=True)

        engine = create_engine(settings.database_url, echo=True)
        Base.metadata.create_all(engine)

        SessionLocal = sessionmaker(bind=engine)

        return engine, SessionLocal

    except Exception as e:
        logger.exception("Failed to connect to database")
        raise e
