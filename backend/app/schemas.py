from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AssessmentRequest(BaseModel):
    patient_id: Optional[str] = "Unknown"
    patient_name: Optional[str] = "Unknown"
    age: Optional[int] = 0
    gestational_week: Optional[int] = 0
    blood_pressure_sys: Optional[int] = None
    blood_pressure_dia: Optional[int] = None
    symptoms: List[str] = []
    observation_notes: Optional[str] = ""
    language: Optional[str] = "en"
    image_observation: Optional[str] = ""

class AssessmentResponse(BaseModel):
    risk_level: str
    summary: str
    warning_signs: List[str]
    recommended_action: str
    referral_needed: bool
    referral_letter: Optional[str] = None
    disclaimer: str = "SANA is a hackathon prototype for educational and demonstration purposes only. It is not a certified medical device and does not provide diagnosis or treatment. Always consult qualified healthcare professionals and follow local emergency protocols."

class VisitCreate(BaseModel):
    patient_id: Optional[str]
    patient_name: Optional[str]
    age: Optional[int]
    gestational_week: Optional[int]
    blood_pressure_sys: Optional[int]
    blood_pressure_dia: Optional[int]
    symptoms: str
    observation_notes: Optional[str]
    image_observation: Optional[str]
    risk_level: str
    summary: str
    warning_signs: str
    recommended_action: str
    referral_needed: bool
    referral_letter: Optional[str]

class VisitResponse(VisitCreate):
    id: int
    visit_date: datetime

    class Config:
        from_attributes = True

class ImageAssessmentRequest(BaseModel):
    image_type: str # eyes, ankles, abdomen, newborn skin, other
    observed_signs: str

class ImageAssessmentResponse(BaseModel):
    possible_flags: List[str]
    disclaimer: str = "Not a diagnosis. This is an observational tool for educational purposes only."
