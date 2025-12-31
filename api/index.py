import os
import sys

# 1. Setup paths
api_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(api_dir)
backend_path = os.path.join(project_root, "backend")

if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# 2. Import Mangum and the App
from mangum import Mangum
from app.main import app as fastapi_app

# 3. Native Handler
# This is the cleanest possible bridge for Vercel.
handler = Mangum(fastapi_app, lifespan="off")

# Vercel looks for 'app' by default in many patterns
app = handler
