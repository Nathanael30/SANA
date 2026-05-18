from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from .database import Base

class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, index=True)
    patient_name = Column(String)
    age = Column(Integer)
    gestational_week = Column(Integer)
    blood_pressure_sys = Column(Integer, nullable=True)
    blood_pressure_dia = Column(Integer, nullable=True)
    symptoms = Column(String) # JSON string or comma-separated
    observation_notes = Column(String, nullable=True)
    image_observation = Column(String, nullable=True)
    
    # Results
    risk_level = Column(String)
    summary = Column(String)
    warning_signs = Column(String)
    recommended_action = Column(String)
    referral_needed = Column(Boolean, default=False)
    referral_letter = Column(String, nullable=True)
    
    visit_date = Column(DateTime, default=datetime.utcnow)
