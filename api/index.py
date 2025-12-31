import os
import sys
from mangum import Mangum

# 1. Fix the Pathing logic
# Find the 'backend' folder
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
backend_path = os.path.join(project_root, "backend")

# Ensure it's at the very front of the path
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# 2. Defensive Import
# We import from 'app.main' and rename it 'fastapi_entry' to avoid name collisions
try:
    from app.main import app as fastapi_entry
    # We name the variable 'app' because that is exactly what Vercel is looking for
    app = Mangum(fastapi_entry, lifespan="off")
except Exception as e:
    # If it fails, we catch it and return a pure Python dict 
    # (Vercel will show this instead of crashing)
    import traceback
    error_msg = f"Backend Load Failure: {str(e)}\n{traceback.format_exc()}"
    print(error_msg)
    
    from fastapi import FastAPI
    err_app = FastAPI()
    @err_app.get("/{full_path:path}")
    def error_page(full_path: str = "/"):
        return {
            "status": "initialization_failed",
            "error": str(e),
            "traceback": traceback.format_exc()
        }
    app = Mangum(err_app)
