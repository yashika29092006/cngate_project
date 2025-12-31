try:
    import os
    import sys
    from mangum import Mangum

    # Add backend to path
    backend_path = os.path.join(os.path.dirname(__file__), "..", "backend")
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)

    from app.main import app as fastapi_app
    # Bridge FastAPI and Vercel/Lambda
    app = Mangum(fastapi_app, lifespan="off")

except Exception as e:
    import traceback
    error_details = traceback.format_exc()
    from fastapi import FastAPI
    from mangum import Mangum
    
    error_app = FastAPI()
    @error_app.get("/{full_path:path}")
    def fallback(full_path: str = "/"):
        return {
            "status": "initialization_failed",
            "error": str(e),
            "traceback": error_details
        }
    app = Mangum(error_app)
