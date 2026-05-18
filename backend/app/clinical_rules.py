def calculate_gestational_age(lmp_date):
    # Placeholder for actual date math
    pass

def flag_emergency(data):
    symptoms = [s.lower() for s in data.get('symptoms', [])]
    emergency_signs = [
        "severe headache", "seizures", "heavy bleeding", 
        "severe abdominal pain", "unconsciousness", "no fetal movement"
    ]
    for sign in emergency_signs:
        if sign in symptoms:
            return True
            
    sys = data.get('blood_pressure_sys')
    dia = data.get('blood_pressure_dia')
    if sys and dia:
        if sys >= 160 or dia >= 110:
            return True
    
    return False

def score_preeclampsia_risk(data):
    sys = data.get('blood_pressure_sys')
    dia = data.get('blood_pressure_dia')
    symptoms = [s.lower() for s in data.get('symptoms', [])]
    week = data.get('gestational_week', 0)
    
    if week >= 20:
        if (sys and sys >= 140) or (dia and dia >= 90):
            if "headache" in symptoms or "blurred vision" in symptoms or "swelling" in symptoms or "edema" in symptoms:
                return "HIGH"
            return "MODERATE"
    return "LOW"

def check_anemia_from_observation(notes):
    notes_lower = notes.lower() if notes else ""
    if "pallor" in notes_lower or "pale" in notes_lower or "white inner eyelid" in notes_lower:
        return True
    return False

def check_newborn_jaundice_from_observation(notes):
    notes_lower = notes.lower() if notes else ""
    if "yellow" in notes_lower or "jaundice" in notes_lower:
        return True
    return False

def assess_risk(data: dict):
    if flag_emergency(data):
        return "EMERGENCY"
        
    pe_risk = score_preeclampsia_risk(data)
    if pe_risk == "HIGH":
        return "HIGH"
        
    symptoms = data.get('symptoms', [])
    if symptoms or check_anemia_from_observation(data.get('observation_notes')) or pe_risk == "MODERATE":
        return "MODERATE"
        
    return "LOW"
