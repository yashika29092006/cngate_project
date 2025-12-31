import os
import sys

# 1. Calculate paths using absolute resolution
# This file is in /api/index.py, root is /, backend is /backend
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
backend_path = os.path.join(project_root, "backend")

# 2. Inject into sys.path
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# 3. Defensive Import
try:
    from mangum import Mangum
    from app.main import app as fastapi_app
    # Variable MUST be named 'app' for Vercel
    app = Mangum(fastapi_app, lifespan="off")
except Exception as e:
    import traceback
    from fastapi import FastAPI
    # Fallback app to catch and show the EXACT error 
    error_app = FastAPI()
    @error_app.get("/{full_path:path}")
    def fallback(full_path: str = "/"):
        return {
            "error_type": "InitializationError",
            "message": str(e),
            "traceback": traceback.format_exc(),
            "paths": {
                "current_dir": current_dir,
                "backend_path": backend_path,
                "sys_path": sys.path[:5]
            }
        }
    app = Mangum(error_app)
