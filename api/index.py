import os
import sys
from mangum import Mangum

# Get the absolute path to the 'backend' directory
# In Vercel, the file is in api/index.py, so its parent's parent is the root.
api_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(api_dir)
backend_path = os.path.join(project_root, "backend")

# VERY IMPORTANT: Only add the backend path. 
# Do NOT add project_root to sys.path, or it will create duplicate module paths
# (e.g. app.main vs backend.app.main) which causes SQLAlchemy errors.
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Clear any existing 'app' modules to prevent caching issues during dev-reloads
if 'app' in sys.modules:
    for mod in list(sys.modules.keys()):
        if mod.startswith('app.') or mod == 'app':
            del sys.modules[mod]

try:
    # This will load backend/app/main.py
    from app.main import app as fastapi_app
    # Bridge FastAPI and Vercel
    app = Mangum(fastapi_app, lifespan="off")
except Exception as e:
    import traceback
    from fastapi import FastAPI
    
    error_app = FastAPI()
    @error_app.get("/{full_path:path}")
    def fallback(full_path: str = "/"):
        return {
            "status": "error",
            "message": "Backend initialization failed",
            "error_detail": str(e),
            "traceback": traceback.format_exc(),
            "sys_path": sys.path
        }
    app = Mangum(error_app)
