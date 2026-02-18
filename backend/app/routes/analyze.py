from fastapi import APIRouter
from pydantic import BaseModel
from ai_engine.text.phishing_model import detect_phishing

router=APIRouter()

class TextInput(BaseModel):
    text:str

@router.post("/analyze")
def analyze(data:TextInput):
    score=detect_phishing(data.text)
    return {"risk_score":score}
