from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.models.station import Station
from app.models.contact import ContactRequest
from app.auth import get_current_admin

router = APIRouter(prefix="/super-admin", tags=["Super Admin"])

SUPER_ADMIN_EMAIL = "superadmin@cngate.com"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_super_admin(current_admin: dict = Depends(get_current_admin)):
    if current_admin.get("sub") != SUPER_ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Not authorized as Super Admin")
    return current_admin

@router.get("/stations/pending")
def get_pending_stations(db: Session = Depends(get_db), _: dict = Depends(verify_super_admin)):
    return db.query(Station).filter(Station.status == "pending").all()

@router.post("/stations/{station_id}/approve")
def approve_station(station_id: int, db: Session = Depends(get_db), _: dict = Depends(verify_super_admin)):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    station.status = "approved"
    db.commit()
    return {"message": "Station approved"}

@router.post("/stations/{station_id}/reject")
def reject_station(station_id: int, db: Session = Depends(get_db), _: dict = Depends(verify_super_admin)):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    db.delete(station)
    db.commit()
    return {"message": "Station rejected and deleted"}

@router.get("/contacts")
def get_contact_requests(db: Session = Depends(get_db), _: dict = Depends(verify_super_admin)):
    return db.query(ContactRequest).order_by(ContactRequest.created_at.desc()).all()

@router.delete("/contacts/{contact_id}")
def delete_contact_request(contact_id: int, db: Session = Depends(get_db), _: dict = Depends(verify_super_admin)):
    contact = db.query(ContactRequest).filter(ContactRequest.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact request not found")
    
    db.delete(contact)
    db.commit()
    return {"message": "Contact request deleted"}

@router.post("/contacts/{contact_id}/respond")
def respond_to_contact_request(contact_id: int, data: dict, db: Session = Depends(get_db), _: dict = Depends(verify_super_admin)):
    # data format: {"response": "The response message"}
    contact = db.query(ContactRequest).filter(ContactRequest.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact request not found")
    
    response_text = data.get("response")
    if not response_text:
        raise HTTPException(status_code=400, detail="Response text is required")
        
    contact.admin_response = response_text
    from datetime import datetime
    contact.responded_at = datetime.now()
    
    db.commit()
    return {"message": "Response sent successfully"}
