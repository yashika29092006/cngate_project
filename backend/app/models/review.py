from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database.db import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)
    station_id = Column(Integer, ForeignKey("stations.id"))
    user_email = Column(String)
    rating = Column(Float)
    comment = Column(String)
