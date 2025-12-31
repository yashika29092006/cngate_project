import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# 1. Setup paths so routers can find their models
api_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(api_dir)
backend_path = os.path.join(project_root, "backend")

if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# 2. Database Initialization logic
@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs on startup
    try:
        from app.database.db import engine, Base
        # Force table creation on startup
        Base.metadata.create_all(bind=engine)
        print("Database tables verified.")
    except Exception as e:
        print(f"Startup Database Error: {e}")
    yield

# 3. Create the App instance
app = FastAPI(root_path="/api", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Import and include your existing logic
try:
    from app.routers import user, admin, station, review, contact, super_admin
    
    app.include_router(user.router)
    app.include_router(admin.router)
    app.include_router(station.router)
    app.include_router(review.router)
    app.include_router(contact.router)
    app.include_router(super_admin.router)
except Exception as e:
    import traceback
    print(f"IMPORT ERROR: {e}")
    print(traceback.format_exc())

# 5. Diagnostic Endpoints
@app.get("/api/health")
@app.get("/health")
def health():
    db_status = "Unknown"
    try:
        from sqlalchemy import text
        from app.database.db import engine
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "Connected"
    except Exception as e:
        db_status = f"Failed: {str(e)}"
    
    return {
        "status": "ok", 
        "message": "Zero-Config API is LIVE!",
        "database": db_status
    }

@app.get("/api/")
@app.get("/")
def root():
    return {"message": "CNGate API is running", "root_path": "/api"}
