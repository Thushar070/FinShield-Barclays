from faster_whisper import WhisperModel
from ai_engine.text.phishing_model import detect_phishing

# fast lightweight model
model=WhisperModel("tiny",device="cpu",compute_type="int8")

def detect_audio_fraud(audio_path:str)->float:
    segments,_=model.transcribe(audio_path,beam_size=1)

    transcript=""
    count=0

    # read only first few segments for speed
    for seg in segments:
        transcript+=seg.text+" "
        count+=1
        if count>=5:   # limit processing
            break

    transcript=transcript.strip()

    if not transcript:
        return 0.0

    return detect_phishing(transcript)
