import os
import sys
from mangum import Mangum

# Add the backend folder to the Python path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import the actual FastAPI app
from app.main import app as fastapi_app

# The variable 'app' is what Vercel (and Mangum) expects
app = Mangum(fastapi_app, lifespan="off")
