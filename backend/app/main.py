from fastapi import FastAPI
from app.database.db import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from app.routers import user, admin, station, review, contact, super_admin

app = FastAPI(title="CNGate Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://cngate-frontend.netlify.app", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional DB init
def init_db():
    try:
        from app.database.db import Base, engine
        Base.metadata.create_all(bind=engine)
    except:
        pass

@app.get("/")
def root():
    return {"status": "ok", "message": "CNGate Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "CNGate Backend is running"}

app.include_router(user.router)
app.include_router(admin.router)
app.include_router(station.router)
app.include_router(review.router)
app.include_router(contact.router)
app.include_router(super_admin.router)
