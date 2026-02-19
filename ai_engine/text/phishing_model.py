import re
from transformers import pipeline

# semantic fraud detection model
classifier=pipeline("zero-shot-classification",
                    model="facebook/bart-large-mnli")

FRAUD_LABELS=[
    "phishing attempt",
    "credential theft",
    "financial scam",
    "social engineering attack"
]

def ai_score(text:str)->float:
    result=classifier(text,FRAUD_LABELS)
    return max(result["scores"])

def heuristic_score(text:str)->float:
    text=text.lower()
    score=0.0

    if re.search(r"http[s]?://",text):
        score+=0.3

    if any(w in text for w in ["password","otp","pin","account","verify"]):
        score+=0.3

    if any(w in text for w in ["urgent","immediately","suspended","blocked"]):
        score+=0.2

    return min(score,1.0)

def detect_phishing(text:str)->float:
    ai=ai_score(text)
    h=heuristic_score(text)

    # hybrid fusion
    final=0.7*ai+0.3*h
    return round(min(final,1.0),2)
