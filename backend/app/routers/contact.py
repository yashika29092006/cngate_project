from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.models.contact import ContactRequest
from pydantic import BaseModel

router = APIRouter(prefix="/contact", tags=["Contact"])

class ContactSchema(BaseModel):
    name: str
    email: str
    phone: str = ""
    message: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def submit_contact_request(contact: ContactSchema, db: Session = Depends(get_db)):
    db_contact = ContactRequest(**contact.dict())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return {"message": "Contact request submitted successfully"}

@router.get("/responses")
def get_responded_contacts(db: Session = Depends(get_db)):
    # Only return requests that have an admin response
    return db.query(ContactRequest).filter(ContactRequest.admin_response != None).order_by(ContactRequest.responded_at.desc()).all()
