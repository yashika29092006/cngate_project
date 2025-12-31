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

# AUTOMATIC CLEANUP: Strip 'prepared_statements' from URL if it exists
# This prevents the 'invalid connection option' error in psycopg2
if "prepared_statements=" in DATABASE_URL:
    import urllib.parse as urlparse
    url_parts = list(urlparse.urlparse(DATABASE_URL))
    query = dict(urlparse.parse_qsl(url_parts[4]))
    query.pop('prepared_statements', None)
    url_parts[4] = urlparse.urlencode(query)
    DATABASE_URL = urlparse.urlunparse(url_parts)

# Engine configuration optimized for Serverless (Vercel) and Supabase
# We remove prepared statement handling from the URL and handle it via pool_pre_ping
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,    # This checks if the connection is alive before using it
    pool_size=1,           # Keep pool tiny to avoid Supabase connection limits
    max_overflow=0,
    pool_recycle=300,
    connect_args={
        "connect_timeout": 10,
        "sslmode": "require",
        "options": "-c prepared_statements=off" # CORRECT WAY to disable for Supabase Pooler
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
