import os
import sys

# 1. Setup the backend path
api_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(api_dir)
backend_path = os.path.join(project_root, "backend")

if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# 2. Import the FastAPI instance directly
# Vercel handles FastAPI naturally without needing Mangum
try:
    from app.main import app
except Exception as e:
    import traceback
    print(f"FAILED TO LOAD BACKEND: {e}")
    print(traceback.format_exc())
    # We raise it so Vercel logs the error clearly
    raise e
