import re
from transformers import pipeline

classifier=pipeline(
    "text-classification",
    model="cybersectony/phishing-email-detection-distilbert_v2.4.1"
)

def keyword_score(text):
    suspicious=["urgent","verify","password","login","bank","otp","click","suspend","secure","account"]
    words=text.lower().split()
    hits=sum(1 for w in words if w in suspicious)
    return min(hits/5,1.0)

def url_score(text):
    urls=re.findall(r'http[s]?://\S+',text)
    if not urls:
        return 0
    score=0
    for url in urls:
        if any(x in url.lower() for x in ["login","secure","verify","bank","account"]):
            score+=0.5
    return min(score,1.0)

def detect_phishing(text):
    ai_result=classifier(text)[0]
    ai_score=ai_result["score"]

    k_score=keyword_score(text)
    u_score=url_score(text)

    # stronger heuristic weighting
    final=0.4*ai_score+0.4*k_score+0.2*u_score

    return round(min(final,1.0),2)

