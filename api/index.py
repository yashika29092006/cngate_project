import os
import sys

# Move the safety net to the absolute top
try:
    from mangum import Mangum
    from fastapi import FastAPI
    import traceback
except ImportError as e:
    # If the basic libraries are missing, we can't even use Mangum.
    # We must define an 'app' that Vercel can at least try to call.
    def app(event, context):
        return {
            "statusCode": 500,
            "body": f"Critical Error: Missing core libraries (fastapi/mangum). Error: {str(e)}"
        }
    # Stop here
    sys.exit(0)

def create_emergency_app(error_msg, trace):
    err_app = FastAPI()
    @err_app.get("/{full_path:path}")
    def fallback(full_path: str = "/"):
        return {
            "status": "initialization_failed",
            "error": str(error_msg),
            "traceback": trace,
            "solution": "Check your DATABASE_URL for special characters like @ in the password."
        }
    return Mangum(err_app)

try:
    # Add backend to path
    backend_path = os.path.join(os.path.dirname(__file__), "..", "backend")
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)

    # Try to import the real app
    from app.main import app as fastapi_app
    app = Mangum(fastapi_app, lifespan="off")

except Exception as e:
    # Capture the specific error (likely the @ in the DB URL)
    app = create_emergency_app(e, traceback.format_exc())
