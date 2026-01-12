from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.models.user import User
from app.schemas.user import UserSignup, UserLogin
from app.auth import get_password_hash, verify_password, create_access_token, decode_token, get_current_user

router = APIRouter(prefix="/user", tags=["User"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/signup")
def user_signup(user: UserSignup, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = get_password_hash(user.password)
    user_data = user.dict()
    user_data['password'] = hashed_password
    
    db.add(User(**user_data))
    db.commit()
    return {"message": "User registered"}

@router.post("/login")
def user_login(user: UserLogin, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.email == user.email).first()

    if not u or not verify_password(user.password, u.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
# create jwt token here
    access_token = create_access_token(data={"sub": u.email, "role": "user"})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "email": u.email,
            "name": u.name,
            "phone": u.phone,
            "vehicle": u.vehicle
        }
    }

@router.post("/forgot-password")
def forgot_password(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    new_password = data.get("password")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.password = get_password_hash(new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.get("/profile")
def get_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    u = db.query(User).filter(User.email == current_user.get("sub")).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "name": u.name,
        "email": u.email,
        "phone": u.phone,
        "vehicle": u.vehicle
    }
