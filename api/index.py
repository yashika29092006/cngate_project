from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()

@app.get("/api/health")
@app.get("/health")
def health():
    return {
        "status": "ok", 
        "message": "Vercel Entry Point is WORKING!",
        "next_step": "If you see this, we will now re-attach the backend folder."
    }

# This is the variable Vercel's @vercel/python looks for
handler = Mangum(app, lifespan="off")
