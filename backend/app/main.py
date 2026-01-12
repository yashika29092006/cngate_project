from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    
    try:
        from app.database.db import engine, Base
    except Exception as e:
        print(f"Startup DB Warning: {e}")
    yield

app = FastAPI(title="CNGate Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# checking backend
@app.get("/api/health")
@app.get("/health")
def health():
    return {"status": "ok", "message": "Backend is running on Vercel!"}

@app.get("/api/")
@app.get("/")
def root():
    return {"message": "CNGate API Root"}
from app.routers import user, admin, station, review, contact, super_admin
app.include_router(user.router)
app.include_router(admin.router)
app.include_router(station.router)
app.include_router(review.router)
app.include_router(contact.router)
app.include_router(super_admin.router)
