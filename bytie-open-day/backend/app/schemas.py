from pydantic import BaseModel, Field
from typing import List, Literal, Optional

# --- Zoom Schemas ---
class ZoomScoreRequest(BaseModel):
    answered_stage: Optional[int]  # 0 à 4, ou None si échec
    wrong_guesses: int

class ZoomScoreResponse(BaseModel):
    round_score: int

# --- Connections Schemas ---
class ConnectionsScoreRequest(BaseModel):
    found_group_points: int  # Somme des points des groupes trouvés
    mistakes: int
    time_left_sec: float
    all_found: bool

class ConnectionsScoreResponse(BaseModel):
    score: int

# --- Timeline Schemas ---
class TimelineScoreRequest(BaseModel):
    player_order_years: List[int]
    time_left_sec: float

class TimelineScoreResponse(BaseModel):
    score: int

# --- AI Feedback Schemas ---
# Valeurs fermées (Literal) : le client ne peut pas injecter de texte libre dans le prompt envoyé à Gemini.
RankTitle = Literal["PRO MASTER", "INTERMEDIATE", "BEGINNER"]


class AIAnalysisRequest(BaseModel):
    zoom_score: int = Field(ge=0, le=100)
    connections_score: int = Field(ge=0, le=100)
    timeline_score: int = Field(ge=0, le=100)
    rank_title: RankTitle
    language: Literal["en", "fr"] = "en"


class AIAnalysisResponse(BaseModel):
    comment: str
    # "gemini" = texte généré par l'IA ; "fallback" = texte local (clé absente, quota, réseau...)
    source: Literal["gemini", "fallback"]
    model: Optional[str] = None
