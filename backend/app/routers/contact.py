from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.models.contact import ContactRequest
from pydantic import BaseModel

router = APIRouter(prefix="/api/contact", tags=["Contact"])

class ContactSchema(BaseModel):
    name: str
    email: str
    phone: str = ""
    message: str
    role: str = None
    station_name: str = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def submit_contact_request(contact: ContactSchema, db: Session = Depends(get_db)):
    try:
        db_contact = ContactRequest(**contact.dict())
        db.add(db_contact)
        db.commit()
        db.refresh(db_contact)
        return {"message": "Contact request submitted successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error submitting contact request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/responses")
def get_responded_contacts(db: Session = Depends(get_db)):
    # Only return requests that have an admin response
    return db.query(ContactRequest).filter(ContactRequest.admin_response != None).order_by(ContactRequest.responded_at.desc()).all()
