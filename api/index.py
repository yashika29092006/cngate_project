import os
import sys
import traceback

# 1. Environment Setup
try:
    # Ensure current dir and backend are in path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    backend_dir = os.path.join(project_root, "backend")
    
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

    from mangum import Mangum
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
except Exception as e:
    # If even basic imports fail, we must define a raw handler
    def app(event, context):
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": '{"error": "Basic Import Failed", "msg": "' + str(e) + '"}'
        }
    sys.exit(0)

# Define the app logic carefully
def create_app():
    try:
        from app.main import app as real_app
        return real_app
    except Exception as e:
        # Fallback app if 'app.main' crashes
        err_app = FastAPI()
        @err_app.get("/{full_path:path}")
        def err(full_path: str = "/"):
            return {
                "status": "error",
                "message": str(e),
                "traceback": traceback.format_exc(),
                "note": "Make sure DATABASE_URL has %40 instead of @"
            }
        return err_app

# Vercel entry point
fastapi_app = create_app()
app = Mangum(fastapi_app, lifespan="off")
