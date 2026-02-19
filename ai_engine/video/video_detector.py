import cv2
import os
import logging
from moviepy import VideoFileClip
from ai_engine.audio.audio_detector import detect_audio_fraud
from ai_engine.image.image_detector import detect_image_phishing

logger = logging.getLogger(__name__)

def detect_video_fraud(video_path: str) -> dict:
    audio_result = {"score": 0.0, "transcription": "", "signals": []}
    frame_result = {"score": 0.0, "ocr_text": "", "signals": []}
    
    audio_path = None
    frame_path = None

    # 1. Audio Analysis
    try:
        clip = VideoFileClip(video_path)
        if clip.audio:
            audio_path = video_path + "_temp.wav"
            clip.audio.write_audiofile(audio_path, verbose=False, logger=None)
            audio_result = detect_audio_fraud(audio_path)
        clip.close()
    except Exception as e:
        logger.warning(f"Audio extraction warning: {e}")

    # 2. Frame Analysis (Extract 1 key frame)
    try:
        cap = cv2.VideoCapture(video_path)
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                frame_path = video_path + "_temp.jpg"
                cv2.imwrite(frame_path, frame)
                frame_result = detect_image_phishing(frame_path)
        cap.release()
    except Exception as e:
        logger.warning(f"Frame extraction warning: {e}")

    # Cleanup temp files
    if audio_path and os.path.exists(audio_path):
        try: os.remove(audio_path)
        except: pass
        
    if frame_path and os.path.exists(frame_path):
        try: os.remove(frame_path)
        except: pass

    # Combine Results
    final_score = round(max(audio_result["score"], frame_result["score"]), 2)
    
    combined_signals = []
    if audio_result["score"] > 0.4:
        combined_signals.append(f"Audio Risk ({audio_result['score']}): " + ", ".join(audio_result["signals"][:2]))
    if frame_result["score"] > 0.4:
        combined_signals.append(f"Visual Risk ({frame_result['score']}): " + ", ".join(frame_result["signals"][:2]))
        
    combined_text = f"Audio: {audio_result['transcription']} | Visual: {frame_result.get('ocr_text','')}"

    return {
        "score": final_score,
        "transcription": combined_text,
        "signals": combined_signals
    }
