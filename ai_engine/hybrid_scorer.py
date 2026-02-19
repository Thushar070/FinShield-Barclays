import re
from urllib.parse import urlparse

# Signals weights (0.0 to 1.0)
WEIGHTS = {
    "urgency": 0.25,
    "financial": 0.20,
    "threat": 0.25,
    "link": 0.20,
    "pii_request": 0.30,
    "credential_request": 0.40,
    "crypto": 0.15
}

KEYWORDS = {
    "urgency": [
        "urgent", "immediately", "expire", "suspended", "verify now", "act now",
        "limited time", "immediate action", "24 hours", "account closure",
        "unauthorized", "suspicious activity", "locked"
    ],
    "financial": [
        "bank", "credit card", "payment", "transfer", "wire", "invoice",
        "transaction", "billing", "refund", "paypal", "wallet", "irs", "tax"
    ],
    "threat": [
        "arrest", "warrant", "legal action", "court", "prosecuted", "jail",
        "police", "fbi", "lawsuit", "compromised", "breach"
    ],
    "credential_request": [
        "password", "ssn", "social security", "pin", "login", "verify your identity",
        "update your details", "confirm your data"
    ],
    "crypto": [
        "bitcoin", "btc", "ethereum", "crypto", "wallet address", "investment",
        "guaranteed return"
    ]
}

def analyze_heuristic_signals(text: str) -> dict:
    """
    Analyzes text for specific fraud indicators and calculates a heuristic risk score.
    Returns a dict with breakdown of signals and the calculated heuristic score.
    """
    text_lower = text.lower()
    signals = []
    score_accum = 0.0
    detected_categories = set()

    # 1. Check for suspicious links
    urls = re.findall(r'https?://\S+|www\.\S+', text)
    if urls:
        signals.append(f"Contains {len(urls)} external link(s)")
        score_accum += WEIGHTS["link"]
        detected_categories.add("link")
        
        # Check for IP address URLs or suspicious TLDs
        for url in urls:
            if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url):
                signals.append("Suspicious IP-based URL detected")
                score_accum += 0.2

    # 2. Check for keywords
    for category, words in KEYWORDS.items():
        found = [w for w in words if w in text_lower]
        if found:
            # We don't want to double count, so we cap the contribution per category
            # but getting multiple hits in one category strengthens confidence
            match_strength = min(len(found) * 0.1, 1.0) # Up to full weight
            contribution = WEIGHTS[category] * match_strength
            
            score_accum += contribution
            detected_categories.add(category)
            
            # Add specific signal for top matches
            if len(found) <= 2:
                signals.append(f"Suspicious {category} language: '{', '.join(found)}'")
            else:
                signals.append(f"Multiple {category} keywords detected ({len(found)})")

    # 3. Check for urgency + link pattern (High Risk)
    if "urgency" in detected_categories and "link" in detected_categories:
        signals.append("High Risk Pattern: Urgency + Link")
        score_accum += 0.3

    # 4. Check for credential request + link (Critical Risk)
    if "credential_request" in detected_categories and "link" in detected_categories:
        signals.append("Critical Pattern: Credential request + Link")
        score_accum += 0.4

    # Cap heuristic score at 0.95 (leave some room)
    heuristic_score = min(score_accum, 0.95)

    return {
        "heuristic_score": heuristic_score,
        "signals": signals,
        "categories": list(detected_categories)
    }

def combine_scores(ai_score: float, heuristic_data: dict) -> float:
    """
    Combines BERT model score with heuristic score using a weighted approach.
    Heuristics act as a 'floor' for high-risk patterns.
    """
    h_score = heuristic_data["heuristic_score"]
    
    # If high heuristic score, we trust it more
    if h_score > 0.6:
        final_score = max(ai_score, h_score)
    else:
        # Otherwise, average them but bias towards AI
        final_score = (ai_score * 0.6) + (h_score * 0.4)
        
    return round(min(final_score, 0.99), 2)
