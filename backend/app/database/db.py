from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Local fallback
    DATABASE_URL = "postgresql://postgres:AcademyRootPassword@localhost:5432/cngate_data"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=3,          # Optimized for Supabase pooler
    max_overflow=2,       # Prevents connection exhaustion
    connect_args={
        "connect_timeout": 10,
        "sslmode": "require"
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
