from pydantic import BaseModel

class ReviewCreate(BaseModel):
    station_id: int
    rating: float
    comment: str

class ReviewRead(ReviewCreate):
    id: int
    user_email: str

    class Config:
        from_attributes = True
