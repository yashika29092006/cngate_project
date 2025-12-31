import os
import sys
from mangum import Mangum

# Add the backend folder to the Python path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import the actual FastAPI app from backend/app/main.py
try:
    from app.main import app as fastapi_app
    app = Mangum(fastapi_app, lifespan="off")
except Exception as e:
    # If the backend still fails to load, show us why
    from fastapi import FastAPI
    import traceback
    
    error_app = FastAPI()
    @error_app.get("/{full_path:path}")
    def fallback(full_path: str = "/"):
        return {
            "status": "error",
            "message": "Backend failed to load",
            "error_detail": str(e),
            "traceback": traceback.format_exc()
        }
    app = Mangum(error_app)
