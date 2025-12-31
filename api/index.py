try:
    import os
    import sys
    from mangum import Mangum

    # Add backend to path
    backend_path = os.path.join(os.path.dirname(__file__), "..", "backend")
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)

    from app.main import app
    # Mangum is an adapter for running ASGI applications (like FastAPI) on AWS Lambda and Vercel
    handler = Mangum(app, lifespan="off")
except Exception as e:
    import traceback
    error_details = traceback.format_exc()
    print(f"Error initializing application: {e}")
    print(error_details)
    # Fallback to a simple app if the main one fails to load
    from fastapi import FastAPI
    error_app = FastAPI()
    
    @error_app.get("/")
    @error_app.get("/{full_path:path}")
    def error_fallback(full_path: str = "/"):
        return {
            "error": "Backend Initialization Failed", 
            "detail": str(e),
            "cwd": os.getcwd(),
            "dir_contents": os.listdir(os.getcwd()),
            "backend_path": backend_path,
            "sys_path": sys.path,
            "traceback": error_details
        }
    handler = Mangum(error_app)
