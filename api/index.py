import os
import sys

# EXTREMELY ROBUST HANDLER
def handler(req, res=None):
    try:
        # 1. Setup paths
        backend_path = os.path.join(os.path.dirname(__file__), "..", "backend")
        if backend_path not in sys.path:
            sys.path.insert(0, backend_path)

        # 2. Try to import FastAPI and Mangum
        from fastapi import FastAPI
        from mangum import Mangum
        
        # 3. Try to import your actual app
        from app.main import app as fastapi_app
        
        # 4. Wrap and execute
        asgi_handler = Mangum(fastapi_app, lifespan="off")
        return asgi_handler(req, res)

    except Exception as e:
        import traceback
        return {
            "statusCode": 200, # Return 200 so Vercel doesn't show the crash screen
            "headers": {"Content-Type": "application/json"},
            "body": {
                "error": "Backend Failed to Start",
                "message": str(e),
                "traceback": traceback.format_exc(),
                "CRITICAL_TIP": "Verify your DATABASE_URL in Vercel. Ensure @ in password is changed to %40"
            }
        }

# For Vercel builders that look for 'app' or 'handler'
app = handler
