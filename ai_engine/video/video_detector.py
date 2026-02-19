import cv2
import os
from moviepy import VideoFileClip

from ai_engine.audio.audio_detector import detect_audio_fraud
from ai_engine.image.image_detector import detect_image_phishing


def detect_video_fraud(video_path:str)->float:

    audio_score=0.0
    frame_score=0.0

    # ---------- extract audio ----------
    audio_path=None
    try:
        clip=VideoFileClip(video_path)
        if clip.audio is not None:
            audio_path=video_path+"_audio.wav"
            clip.audio.write_audiofile(audio_path,verbose=False,logger=None)
            audio_score=detect_audio_fraud(audio_path)
        clip.close()
    except Exception as e:
        audio_score=0.0

    # ---------- extract frames ----------
    cap=cv2.VideoCapture(video_path)
    frame_count=0

    while cap.isOpened():
        ret,frame=cap.read()
        if not ret or frame_count>=3:
            break

        frame_path=f"{video_path}_frame{frame_count}.jpg"
        cv2.imwrite(frame_path,frame)

        score=detect_image_phishing(frame_path)
        frame_score=max(frame_score,score)

        # cleanup temp frame
        if os.path.exists(frame_path):
            os.remove(frame_path)

        frame_count+=1

    cap.release()

    # cleanup audio file
    if audio_path and os.path.exists(audio_path):
        os.remove(audio_path)

    # ---------- combine ----------
    final=max(audio_score,frame_score)
    return round(final,2)
