import sys
import os

# Add the backend directory to the path so we can import from 'app'
# This allows 'import app' to work if backend/app exists, 
# and 'from app.routers import ...' to work inside the app.
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app
