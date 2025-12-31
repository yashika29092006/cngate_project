import os
import sys
from mangum import Mangum

# 1. SETUP THE PATH
# We move into the 'backend' directory so that 'import app' works naturally.
api_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(api_dir)
backend_dir = os.path.join(project_root, "backend")

# Ensure the backend directory is at the VERY FRONT of the path
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# 2. THE IMPORT
try:
    # This imports backend/app/main.py
    from app.main import app as fastapi_app
    # Bridge FastAPI and Vercel/Lambda
    handler = Mangum(fastapi_app, lifespan="off")
except Exception as e:
    import traceback
    from fastapi import FastAPI
    
    # Emergency error reporter
    error_app = FastAPI()
    @error_app.get("/{full_path:path}")
    def fallback(full_path: str = "/"):
        return {
            "status": "error",
            "message": "The backend failed to load. Check the traceback below.",
            "error_detail": str(e),
            "traceback": traceback.format_exc()
        }
    handler = Mangum(error_app)

# Vercel looks for the 'app' variable by default
app = handler
