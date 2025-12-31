import os
import sys
from mangum import Mangum

# 1. Path Setup: Ensure the 'backend' folder is visible
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# 2. Safety Import: Try to load the app, if it fails, provide a clear error message
try:
    from app.main import app as fastapi_app
    # Bridge FastAPI and Vercel
    app = Mangum(fastapi_app, lifespan="off")
except Exception as e:
    import traceback
    from fastapi import FastAPI
    
    # Emergency fallback app
    error_app = FastAPI()
    @error_app.get("/{full_path:path}")
    def fallback(full_path: str = "/"):
        return {
            "status": "error",
            "message": "The backend failed to initialize. This is usually due to a broken DATABASE_URL.",
            "error_detail": str(e),
            "traceback": traceback.format_exc()
        }
    app = Mangum(error_app)
