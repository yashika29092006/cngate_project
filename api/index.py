import os
import sys
from mangum import Mangum

# 1. Clean up sys.path to prevent duplicate module loading
# We remove the current directory so that 'import app' doesn't get confused
api_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(api_dir)
backend_dir = os.path.join(project_root, "backend")

# Move the backend directory to the very front of the path
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# 2. Safety: Ensure no 'app' is already partially loaded incorrectly
for mod in list(sys.modules.keys()):
    if mod.startswith('app') or mod.startswith('backend.app'):
        del sys.modules[mod]

try:
    # 3. Import the FastAPI app from the now-clean path
    from app.main import app as fastapi_app
    app = Mangum(fastapi_app, lifespan="off")
except Exception as e:
    import traceback
    from fastapi import FastAPI
    
    # Fallback app to show us the REAL error if it still fails
    error_app = FastAPI()
    @error_app.get("/{full_path:path}")
    def fallback(full_path: str = "/"):
        return {
            "status": "error",
            "message": "Backend failed to load",
            "error_detail": str(e),
            "traceback": traceback.format_exc(),
            "debug_paths": {
                "backend_dir": backend_dir,
                "sys_path_start": sys.path[:3]
            }
        }
    app = Mangum(error_app)
