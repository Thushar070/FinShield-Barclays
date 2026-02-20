from faster_whisper import WhisperModel
from ai_engine.text.phishing_model import detect_phishing
import logging

logger = logging.getLogger("finshield")

# lazy load
model_instance = None

def _get_model():
    global model_instance
    if model_instance is None:
        try:
            logger.info("Initializing Audio Whisper model lazily...")
            model_instance = WhisperModel("tiny", device="cpu", compute_type="int8")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            model_instance = False # Indicate load failure vs not loaded
    return model_instance

def detect_audio_fraud(audio_path: str) -> dict:
    model = _get_model()
    if not model:
        return {"score": 0.0, "transcription": "", "signals": ["Audio model unavailable"]}

    try:
        segments, _ = model.transcribe(audio_path, beam_size=1)
        
        # Collect first few segments for speed
        transcript_parts = []
        for i, segment in enumerate(segments):
            transcript_parts.append(segment.text)
            if i >= 5:  # Limit to first 5 segments (~30s)
                break
        
        transcript = " ".join(transcript_parts).strip()
        
        if not transcript:
            return {"score": 0.0, "transcription": "", "signals": ["No speech detected"]}

        analysis = detect_phishing(transcript)
        
        return {
            "score": analysis["final_score"],
            "transcription": transcript,
            "signals": analysis["signals"]
        }

    except Exception as e:
        logger.error(f"Audio transcription failed: {e}")
        return {"score": 0.0, "transcription": "", "signals": ["Audio processing error"]}
