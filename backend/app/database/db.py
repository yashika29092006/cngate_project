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

# Handle Supabase Pooler (Port 6543) requirements
# When using Transaction mode on port 6543, prepared statements must be disabled
if ":6543" in DATABASE_URL and "prepared_statements=" not in DATABASE_URL:
    separator = "&" if "?" in DATABASE_URL else "?"
    DATABASE_URL += f"{separator}prepared_statements=false"

# Engine configuration optimized for serverless (Vercel) and Supabase
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=1,          # Minimal pool for serverless
    max_overflow=0,       # No overflow in serverless to stay within Supabase limits
    pool_recycle=300,     # Recycle connections every 5 minutes
    connect_args={
        "connect_timeout": 10, # Give it a bit more time for initial connection
        "sslmode": "require"
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
