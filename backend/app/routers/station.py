from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.models.station import Station, AvailabilityRequest
from app.models.review import Review
from datetime import datetime, timedelta
from app.auth import get_current_admin, get_current_user

router = APIRouter(prefix="/stations", tags=["Stations"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_stations(db: Session = Depends(get_db)):
    return db.query(Station).filter(
        Station.status == "approved",
        Station.email != "superadmin@cngate.com"
    ).all()

@router.put("/{station_id}")
def update_station(station_id: int, data: dict, db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    if current_admin.get("stationId") != station_id:
        raise HTTPException(status_code=403, detail="You can only update your own station")

    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    for key, value in data.items():
        if key != "password":
            setattr(station, key, value)

    db.commit()
    return {"message": "Updated"}

@router.delete("/{station_id}")
def delete_station(station_id: int, db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    if current_admin.get("stationId") != station_id:
        raise HTTPException(status_code=403, detail="You can only delete your own station")

    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
        
    db.query(Review).filter(Review.station_id == station_id).delete()
    db.query(AvailabilityRequest).filter(AvailabilityRequest.station_id == station_id).delete()

    db.delete(station)
    db.commit()
    return {"message": "Deleted"}

@router.post("/{station_id}/report-availability")
def report_availability(station_id: int, data: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    new_status = data.get("availability")
    if new_status in ["available", "unavailable"]:
        # Create a request instead of updating directly
        req = AvailabilityRequest(
            station_id=station_id,
            requested_availability=new_status,
            status="pending"
        )
        db.add(req)
        db.commit()
        return {"message": "Report submitted for admin approval."}
    
    raise HTTPException(status_code=400, detail="Invalid status")

@router.get("/requests/pending")
def get_availability_requests(db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    station_id = current_admin.get("stationId")
    requests = db.query(AvailabilityRequest).filter(
        AvailabilityRequest.station_id == station_id,
        AvailabilityRequest.status == "pending"
    ).order_by(AvailabilityRequest.timestamp.desc()).all()
    return requests

@router.post("/requests/{req_id}/resolve")
def resolve_availability_request(req_id: int, data: dict, db: Session = Depends(get_db), current_admin: dict = Depends(get_current_admin)):
    # data: {"action": "approve" or "reject"}
    req = db.query(AvailabilityRequest).filter(AvailabilityRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if req.station_id != current_admin.get("stationId"):
        raise HTTPException(status_code=403, detail="Not authorized")

    action = data.get("action")
    if action == "approve":
        req.status = "approved"
        # Update station
        station = db.query(Station).filter(Station.id == req.station_id).first()
        if station:
            station.availability = req.requested_availability
    elif action == "reject":
        req.status = "rejected"
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    db.commit()
    return {"message": f"Request {action}d"}

@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    # Returns stations updated in the last 24 hours
    yesterday = datetime.now() - timedelta(hours=24)
    alerts = db.query(Station).filter(
        Station.last_updated >= yesterday,
        Station.email != "superadmin@cngate.com"
    ).order_by(Station.last_updated.desc()).all()
    return alerts
