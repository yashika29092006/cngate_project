import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Setup paths so routers can find their models
api_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(api_dir)
backend_path = os.path.join(project_root, "backend")

if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# 2. Create the App instance right here
# This prevents the 'issubclass' error because Vercel sees a fresh FastAPI instance
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Import and include your existing logic
try:
    from app.routers import user, admin, station, review, contact, super_admin
    
    app.include_router(user.router)
    app.include_router(admin.router)
    app.include_router(station.router)
    app.include_router(review.router)
    app.include_router(contact.router)
    app.include_router(super_admin.router)
except Exception as e:
    print(f"IMPORT ERROR: {e}")
    # We'll still keep the app running so we can see the error in health check
    pass

@app.get("/api/health")
@app.get("/health")
def health():
    return {"status": "ok", "message": "Zero-Config API is LIVE!"}

@app.get("/api/")
@app.get("/")
def root():
    return {"message": "CNGate API is running"}
