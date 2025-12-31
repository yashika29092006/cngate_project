from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.models.station import Station
from app.schemas.admin import AdminSignup, AdminLogin
from app.auth import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/admin", tags=["Admin"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/signup")
def admin_signup(admin: AdminSignup, db: Session = Depends(get_db)):
    if db.query(Station).filter(Station.email == admin.email).first():
        raise HTTPException(status_code=400, detail="Station already exists with this email")

    hashed_password = get_password_hash(admin.password)
    admin_data = admin.dict()
    admin_data['password'] = hashed_password

    station = Station(
        **admin_data,
        availability="available",
        quantity=500,
        crowd="low",
        price=95.5,
        timing="Open 24 hours"
    )

    db.add(station)
    db.commit()
    return {"message": "Admin/Station registered"}

@router.post("/login")
def admin_login(admin: AdminLogin, db: Session = Depends(get_db)):
    s = db.query(Station).filter(Station.email == admin.email).first()

    if not s or not verify_password(admin.password, s.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": s.email, "role": "admin", "stationId": s.id})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "admin": {
            "stationId": s.id,
            "stationName": s.name,
            "email": s.email
        }
    }

@router.post("/forgot-password")
def forgot_password(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    new_password = data.get("password")
    station = db.query(Station).filter(Station.email == email).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station admin not found")
    
    station.password = get_password_hash(new_password)
    db.commit()
    return {"message": "Password updated successfully"}
