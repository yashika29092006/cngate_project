from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import user, admin, station, review, contact, super_admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs when the app starts
    try:
        from app.database.db import Base, engine
        # Tables aren't usually created on every start in production, 
        # but kept here for now to ensure DB is ready.
        # Base.metadata.create_all(bind=engine) 
    except Exception as e:
        print(f"Startup warning: {e}")
    yield
    # This runs when the app stops

app = FastAPI(title="CNGate Backend", lifespan=lifespan)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # More permissive for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "message": "CNGate Backend is running"}

@app.get("/api/health")
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "CNGate Backend is active"}

app.include_router(user.router)
app.include_router(admin.router)
app.include_router(station.router)
app.include_router(review.router)
app.include_router(contact.router)
app.include_router(super_admin.router)
