from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database.db import Base

class ContactRequest(Base):
    __tablename__ = "contact_requests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    message = Column(String)
    role = Column(String, nullable=True)
    station_name = Column(String, nullable=True)
    admin_response = Column(String, nullable=True)
    responded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())
