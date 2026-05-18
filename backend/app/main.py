from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import models, schemas, database, llm_service
from .database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SANA API", description="Symbiotic AI for Neonatal & Maternal Assistance", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon, allow all
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "SANA Backend is running."}

@app.post("/assess", response_model=schemas.AssessmentResponse)
def assess_patient(request: schemas.AssessmentRequest):
    data = request.model_dump()
    result = llm_service.process_assessment(data)
    return result

@app.post("/visits", response_model=schemas.VisitResponse)
def save_visit(visit: schemas.VisitCreate, db: Session = Depends(database.get_db)):
    db_visit = models.Visit(**visit.model_dump())
    db.add(db_visit)
    db.commit()
    db.refresh(db_visit)
    return db_visit

@app.get("/visits", response_model=List[schemas.VisitResponse])
def get_visits(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    visits = db.query(models.Visit).offset(skip).limit(limit).all()
    return visits

@app.post("/referral")
def generate_referral_endpoint(request: schemas.AssessmentRequest):
    data = request.model_dump()
    result = llm_service.process_assessment(data)
    if result.get("referral_letter"):
        return {"referral_letter": result["referral_letter"]}
    raise HTTPException(status_code=400, detail="Referral not needed based on assessment.")

@app.post("/image-assess", response_model=schemas.ImageAssessmentResponse)
def assess_image(request: schemas.ImageAssessmentRequest):
    flags = llm_service.process_vision_assessment(
        image_type=request.image_type,
        observed_signs=request.observed_signs,
        base64_image=request.base64_image
    )
    return {"possible_flags": flags}
