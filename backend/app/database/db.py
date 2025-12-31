from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Load .env file only if it exists
env_path = os.path.join(os.path.dirname(__file__), "../../.env")
if os.path.exists(env_path):
    load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Local fallback for development
    DATABASE_URL = "postgresql://postgres:AcademyRootPassword@localhost:5432/cngate_data"

# CRITICAL FIX for Supabase Transaction Pooler (Port 6543)
# Transaction mode DOES NOT support prepared statements. 
# We MUST add this parameter or the app will hang/crash.
if ":6543" in DATABASE_URL and "prepared_statements=" not in DATABASE_URL:
    sep = "&" if "?" in DATABASE_URL else "?"
    DATABASE_URL += f"{sep}prepared_statements=false"

# Engine configuration optimized for Serverless (Vercel)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=1,           # Keep pool tiny for serverless
    max_overflow=0,
    pool_recycle=300,      # Recycle connections every 5 mins
    connect_args={
        "connect_timeout": 10,
        "sslmode": "require"
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
