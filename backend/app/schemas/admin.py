from pydantic import BaseModel

class AdminSignup(BaseModel):
    name: str
    area: str
    address: str
    phone: str
    lat: float
    lng: float
    email: str
    password: str
    amenities: str = ""


class AdminLogin(BaseModel):
    email: str
    password: str
