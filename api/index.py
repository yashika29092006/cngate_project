import os
import sys

# 1. Setup absolute paths
# Identify the 'backend' directory relative to this file (api/index.py)
api_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(api_dir)
backend_path = os.path.join(project_root, "backend")

# 2. Inject backend into the system path
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# 3. Import the FastAPI app instance directly
# Vercel's Python runtime (3.9+) automatically detects FastAPI objects named 'app'
try:
    from app.main import app
except Exception as e:
    # If it fails, we need to know why (missing module, syntax error, etc.)
    import traceback
    print(f"CRITICAL: Backend failed to load: {e}")
    print(traceback.format_exc())
    raise e
