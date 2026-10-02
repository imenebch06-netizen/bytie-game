from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import game

app = FastAPI(title="Jeu Mascotte API")

# CORS : autorise le frontend Vite/React (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # incompatible avec "*" selon la spec CORS
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sert les logos : http://localhost:8000/logos/apple.png
LOGOS_DIR = Path(__file__).resolve().parent.parent / "logos"
app.mount("/logos", StaticFiles(directory=LOGOS_DIR), name="logos")

app.include_router(game.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
