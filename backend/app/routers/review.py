from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewRead
from app.auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_review(review: ReviewCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_review = Review(
        **review.dict(),
        user_email=current_user.get("sub")
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.get("/{station_id}")
def get_reviews(station_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.station_id == station_id).all()

@router.delete("/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db), current_admin: dict = Depends(get_current_user)):
    # Check if user is admin
    if current_admin.get("role") != "admin":
         raise HTTPException(status_code=403, detail="Not authorized")
         
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    # Check if admin owns the station
    if review.station_id != current_admin.get("stationId"):
        raise HTTPException(status_code=403, detail="You can only delete reviews for your station")
        
    db.delete(review)
    db.commit()
    return {"message": "Review deleted"}
