from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routes.analyze import router as analyze_router
from backend.app.routes.image import router as image_router
from backend.app.routes.audio import router as audio_router
from backend.app.routes.video import router as video_router

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)
app.include_router(image_router)
app.include_router(audio_router)
app.include_router(video_router)


@app.get("/")
def root():
    return {"message":"FinShield backend running"}
