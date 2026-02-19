from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routes.analyze import router as analyze_router
from backend.app.routes.image import router as image_router

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

@app.get("/")
def root():
    return {"message":"FinShield backend running"}
