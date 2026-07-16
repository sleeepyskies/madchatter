from pathlib import Path

from loguru import logger
from sqlalchemy import create_engine, Engine, event
from sqlalchemy.orm import sessionmaker

from db.base import Base
from settings import settings
# note that we must import models here to ensure the create_all() works
import db.models


# enforces fk constraints for sqlite
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


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

        session = sessionmaker(bind=engine, expire_on_commit=False)
        return engine, session

    except Exception as e:
        logger.exception("Failed to connect to database")
        raise e
