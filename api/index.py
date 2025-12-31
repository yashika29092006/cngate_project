import os
import sys
from mangum import Mangum

# Get the absolute path to the project root
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Add the project root to sys.path
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

# Add the backend directory to sys.path specifically so 'app' can be found
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

try:
    # This should now work regardless of Vercel's working directory
    from app.main import app as fastapi_app
    app = Mangum(fastapi_app, lifespan="off")
except Exception as e:
    import traceback
    from fastapi import FastAPI
    
    error_app = FastAPI()
    @error_app.get("/{full_path:path}")
    def fallback(full_path: str = "/"):
        return {
            "status": "initialization_failed",
            "error": str(e),
            "traceback": traceback.format_exc(),
            "detected_root": ROOT_DIR,
            "sys_path": sys.path
        }
    app = Mangum(error_app)
