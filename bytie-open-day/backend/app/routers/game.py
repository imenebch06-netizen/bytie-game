# app/routers/game.py
import random
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.database import connections_collection, timeline_collection, zoom_collection
from app.schemas import AIAnalysisRequest, AIAnalysisResponse
from app.services.ai_feedback import generate_feedback

router = APIRouter(prefix="/api/game", tags=["Game Session"])

ZOOM_ROUNDS = 3
TIMELINE_ROUNDS = 3


# --- Modeles Pydantic pour valider les requetes POST ---
class ZoomScoreRequest(BaseModel):
    answered_stage: Optional[int] = None
    wrong_guesses: int = 0


async def _sample(collection, size: int) -> list[dict]:
    """Tire `size` documents au hasard et retire le _id (ObjectId non serialisable)."""
    docs = await collection.aggregate([{"$sample": {"size": size}}]).to_list(length=size)
    for doc in docs:
        doc.pop("_id", None)
    return docs


# --- Endpoint 1 : Session de jeu ---
@router.get("/session")
async def get_game_session():
    zoom_items = await _sample(zoom_collection, ZOOM_ROUNDS)
    conn_rounds = await _sample(connections_collection, 1)
    timeline_items = await _sample(timeline_collection, TIMELINE_ROUNDS)

    # Base vide ou mauvais noms de collections : on le dit clairement
    # au lieu de renvoyer un 200 avec des tableaux vides.
    if not zoom_items or not conn_rounds or not timeline_items:
        raise HTTPException(
            status_code=503,
            detail=(
                "Base de donnees vide : lancez `python -m app.seed_db` "
                "(collections attendues : zoom_rounds, connections_rounds, timeline_rounds)."
            ),
        )

    groups = conn_rounds[0]["groups"]
    connections_words = [word for group in groups for word in group["words"]]
    random.shuffle(connections_words)

    return {
        "zoom": zoom_items,
        "connectionsWords": connections_words,
        "connectionsGroups": groups,
        "timeline": timeline_items,
    }


# --- Endpoint 2 : Calcul du score Zoom ---
@router.post("/score/zoom")
async def calculate_zoom_score(payload: ZoomScoreRequest):
    if payload.answered_stage is None:
        return {"score": 0}

    stage_points = {0: 100, 1: 80, 2: 60, 3: 40, 4: 20}
    base_score = stage_points.get(payload.answered_stage, 0)
    penalty = payload.wrong_guesses * 10
    return {"score": max(0, base_score - penalty)}


# --- Endpoint 3 : Analyse de fin de partie (Gemini) ---
@router.post("/ai-analysis", response_model=AIAnalysisResponse)
async def generate_ai_analysis(payload: AIAnalysisRequest):
    comment, source = await generate_feedback(payload)
    return AIAnalysisResponse(
        comment=comment,
        source=source,
        model=settings.GEMINI_MODEL if source == "gemini" else None,
    )
