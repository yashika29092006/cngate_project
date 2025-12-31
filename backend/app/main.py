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

# Try to create tables, but don't crash if it fails
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not create tables: {e}")


@app.get("/")
def root():
    return {"message": "CNGate Backend API is running"}

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "CNGate Backend is running on Vercel"}

app.include_router(user.router)
app.include_router(admin.router)
app.include_router(station.router)
app.include_router(review.router)
app.include_router(contact.router)
app.include_router(super_admin.router)
