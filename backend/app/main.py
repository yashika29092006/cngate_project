from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import user, admin, station, review, contact, super_admin

app = FastAPI(title="CNGate Backend")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://cngate-frontend.netlify.app", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Endpoints (Simple, no DB connections here)
@app.get("/")
def root():
    return {"status": "ok", "message": "CNGate Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "CNGate Backend is active"}

# Include Routers
app.include_router(user.router)
app.include_router(admin.router)
app.include_router(station.router)
app.include_router(review.router)
app.include_router(contact.router)
app.include_router(super_admin.router)

# Database initialization moved to a place where it won't crash the import
@app.on_event("startup")
def on_startup():
    try:
        from app.database.db import Base, engine
        Base.metadata.create_all(bind=engine)
        print("Database initialized.")
    except Exception as e:
        print(f"DB Startup Warning: {e}")
