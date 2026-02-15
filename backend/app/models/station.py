from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database.db import Base

class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    area = Column(String)
    address = Column(String)
    phone = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    availability = Column(String)
    quantity = Column(Integer)
    crowd = Column(String)
    price = Column(Float)
    timing = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    amenities = Column(String, default="") # Comma separated list
    status = Column(String, default="pending") # pending, approved
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())

class AvailabilityRequest(Base):
    __tablename__ = "availability_requests"
    
    id = Column(Integer, primary_key=True)
    station_id = Column(Integer, nullable=False)
    requested_availability = Column(String)
    status = Column(String, default="pending")  # pending, approved, rejected
    timestamp = Column(DateTime, default=func.now())
