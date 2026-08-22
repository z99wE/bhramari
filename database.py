"""Database setup — SQLite for local dev, PostgreSQL for GCP production."""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Auto-detect: use PostgreSQL if DATABASE_URL set, else SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bhramari.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized!")

if __name__ == "__main__":
    init_db()
