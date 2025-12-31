import os
import sys
from mangum import Mangum

try:
    # Add backend to path
    backend_path = os.path.join(os.path.dirname(__file__), "..", "backend")
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)

    from app.main import app
    # Mangum is an adapter for running ASGI applications (like FastAPI) on AWS Lambda and Vercel
    handler = Mangum(app, lifespan="off")
except Exception as e:
    print(f"Error initializing application: {e}")
    # Fallback to a simple app if the main one fails to load
    from fastapi import FastAPI
    error_app = FastAPI()
    @error_app.get("/{full_path:path}")
    def error_fallback(full_path: str):
        return {"error": "Initialization Failed", "detail": str(e)}
    handler = Mangum(error_app)
