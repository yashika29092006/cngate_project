from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Load .env file
# Load .env file only if it exists (for local development)
env_path = os.path.join(os.path.dirname(__file__), "../../.env")
if os.path.exists(env_path):
    load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Local fallback
    DATABASE_URL = "postgresql://postgres:AcademyRootPassword@localhost:5432/cngate_data"

# Engine configuration optimized for serverless (Vercel) and Supabase
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,          # Maintain a small pool
    max_overflow=10,      # Allow more connections during bursts
    pool_recycle=300,     # Recycle connections every 5 minutes
    connect_args={
        "connect_timeout": 10,
        "sslmode": "require"
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
