import os
import json
import ollama
from .clinical_rules import assess_risk
from .referral import generate_referral_letter

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "gemma:2b")

def get_llm_assessment(data: dict, rule_based_risk: str):
    """
    Attempts to get an enhanced assessment from the local Ollama model.
    Falls back to a rule-based response if Ollama is unavailable or fails.
    """
    prompt = f"""
    You are an AI assistant for a Community Health Worker (CHW).
    Patient Data:
    Age: {data.get('age')}
    Gestational Week: {data.get('gestational_week')}
    BP: {data.get('blood_pressure_sys')}/{data.get('blood_pressure_dia')}
    Symptoms: {', '.join(data.get('symptoms', []))}
    Observation Notes: {data.get('observation_notes', '')}
    
    The rule-based system determined the risk is: {rule_based_risk}.
    
    Provide a JSON response with the following keys:
    - "summary": A brief, professional clinical summary.
    - "warning_signs": A list of specific warning signs identified.
    - "recommended_action": Clear instructions for the CHW.
    - "referral_needed": boolean (true if HIGH or EMERGENCY, else false).
    
    Output strictly in valid JSON format.
    """
    
    try:
        response = ollama.chat(model=MODEL_NAME, messages=[
            {
                'role': 'system',
                'content': 'You output only JSON. No markdown formatting.'
            },
            {
                'role': 'user',
                'content': prompt
            }
        ])
        
        result_text = response['message']['content'].strip()
        # Clean up potential markdown formatting if model didn't listen
        if result_text.startswith("```json"):
            result_text = result_text[7:-3].strip()
            
        parsed = json.loads(result_text)
        return parsed
        
    except Exception as e:
        print(f"LLM generation failed: {e}")
        # Fallback
        referral_needed = rule_based_risk in ["HIGH", "EMERGENCY"]
        return {
            "summary": f"Patient assessed as {rule_based_risk} based on provided vitals and symptoms.",
            "warning_signs": data.get('symptoms', []),
            "recommended_action": "Refer to hospital immediately." if referral_needed else "Advise routine care and monitor.",
            "referral_needed": referral_needed
        }

def process_assessment(data: dict):
    risk_level = assess_risk(data)
    
    llm_output = get_llm_assessment(data, risk_level)
    
    referral_letter = None
    if llm_output.get("referral_needed"):
        referral_letter = generate_referral_letter(data, risk_level, llm_output.get("summary", ""))
        
    return {
        "risk_level": risk_level,
        "summary": llm_output.get("summary", "Summary unavailable."),
        "warning_signs": llm_output.get("warning_signs", []),
        "recommended_action": llm_output.get("recommended_action", "Consult a health professional."),
        "referral_needed": llm_output.get("referral_needed", False),
        "referral_letter": referral_letter
    }

def process_vision_assessment(image_type: str, observed_signs: str, base64_image: str = None):
    """
    Calls Ollama vision model if a base64 image is provided.
    """
    flags = []
    
    if base64_image:
        try:
            # We strip the data URI scheme if present (e.g. data:image/jpeg;base64,...)
            if "," in base64_image:
                base64_image = base64_image.split(",")[1]
                
            prompt = f"You are a clinical AI assistant for a CHW. Look at this image of the patient's {image_type}. Additional CHW observation: {observed_signs}. Identify any visible warning signs like pallor, edema, or jaundice. Respond ONLY with a JSON list of strings, for example: [\"Possible Anemia\", \"Possible Edema\"]. If none, return []."
            
            response = ollama.chat(model=MODEL_NAME, messages=[
                {
                    'role': 'user',
                    'content': prompt,
                    'images': [base64_image]
                }
            ])
            
            result_text = response['message']['content'].strip()
            if result_text.startswith("```json"):
                result_text = result_text[7:-3].strip()
            flags = json.loads(result_text)
            return flags
        except Exception as e:
            print(f"Vision model failed: {e}")
            
    # Fallback to simple rule-based if vision fails or no image provided
    obs = observed_signs.lower()
    if image_type == "eyes" and ("pale" in obs or "pallor" in obs or "white" in obs):
        flags.append("Possible Anemia")
    elif image_type == "ankles" and ("swelling" in obs or "edema" in obs):
        flags.append("Possible Edema")
    elif image_type == "newborn skin" and "yellow" in obs:
        flags.append("Possible Jaundice")
        
    if not flags:
        flags.append("No specific visual flags identified.")
        
    return flags
