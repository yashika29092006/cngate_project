import os
import sys
from mangum import Mangum

# Add backend to path
api_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(api_dir)
backend_path = os.path.join(project_root, "backend")

if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import app and wrap with Mangum
try:
    from app.main import app as fastapi_app
    app = Mangum(fastapi_app, lifespan="off")
except Exception as e:
    import traceback
    from fastapi import FastAPI
    error_app = FastAPI()
    @error_app.get("/{full_path:path}")
    def fallback(full_path: str = "/"):
        return {"error": str(e), "traceback": traceback.format_exc()}
    app = Mangum(error_app)
