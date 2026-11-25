from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

IS_SQLITE = settings.sqlalchemy_database_url.startswith("sqlite")

if IS_SQLITE:
    engine = create_engine(settings.sqlalchemy_database_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(
        settings.sqlalchemy_database_url,
        pool_size=settings.sqlalchemy_pool_size,
        max_overflow=settings.sqlalchemy_max_overflow,
        pool_recycle=3600,
        pool_timeout=10,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass
