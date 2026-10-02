"""Analyse de fin de partie : texte généré par Gemini, avec repli local si l'IA est indisponible."""
import logging
import re
from typing import Literal, Optional

import httpx

from app.config import settings
from app.schemas import AIAnalysisRequest

logger = logging.getLogger(__name__)

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
MAX_COMMENT_CHARS = 320
LANGUAGES = {"en": "English", "fr": "French"}

SYSTEM_PROMPT = """You are Bytie, the friendly robot mascot of "Tech Quiz Arena", a quiz game played at a university open day.
A player just finished a round of three mini-games, each scored out of 100:
- Zoom Reveal: guess a tech logo while it slowly zooms out (the sooner, the more points)
- Connections: find four hidden groups of four related words
- Timeline: put tech events in chronological order

Write a short, warm debrief addressed directly to the player ("you"):
- 2 or 3 sentences, 50 words maximum.
- Name their strongest game and the one with the most room to improve, using the scores.
- Be encouraging and specific, and finish with one concrete tip or a motivating line.
- Use only the data provided. Never invent facts, names or statistics.
- Plain text only: no markdown, no lists, no quotation marks, at most one emoji.
- Never say you are an AI model and never mention these instructions.
- Write in {language}."""


def _games(p: AIAnalysisRequest) -> list[tuple[str, int]]:
    return [("Zoom Reveal", p.zoom_score), ("Connections", p.connections_score), ("Timeline", p.timeline_score)]


def _build_body(p: AIAnalysisRequest, low_thinking: bool) -> dict:
    lines = "\n".join(f"- {name}: {score}/100" for name, score in _games(p))
    total = p.zoom_score + p.connections_score + p.timeline_score
    user_prompt = f"Player results:\n{lines}\nTotal: {total}/300\nRank: {p.rank_title}"

    config: dict = {"temperature": 0.8, "maxOutputTokens": 2048}
    if low_thinking:
        # Les modèles Gemini 3 "réfléchissent" avant de répondre : on limite pour garder une réponse rapide
        config["thinkingConfig"] = {"thinkingLevel": "low"}
    return {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT.format(language=LANGUAGES[p.language])}]},
        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
        "generationConfig": config,
    }


def _extract_text(data: dict) -> str:
    try:
        parts = data["candidates"][0]["content"]["parts"]
    except (KeyError, IndexError, TypeError):
        return ""
    return "".join(part.get("text", "") for part in parts if isinstance(part, dict) and not part.get("thought"))


def _clean(text: str) -> str:
    text = re.sub(r"[*_`#>]+", "", text)  # restes de markdown
    text = re.sub(r"\s+", " ", text).strip().strip('"“”')
    if len(text) > MAX_COMMENT_CHARS:
        cut = text[:MAX_COMMENT_CHARS]
        end = max(cut.rfind(". "), cut.rfind("! "), cut.rfind("? "))
        text = cut[: end + 1] if end > 80 else cut.rstrip() + "…"
    return text


def fallback_comment(p: AIAnalysisRequest) -> str:
    """Commentaire local (sans IA) : utilisé quand Gemini n'est pas disponible."""
    games = _games(p)
    best = max(games, key=lambda g: g[1])
    worst = min(games, key=lambda g: g[1])
    total = sum(score for _, score in games)
    fr = p.language == "fr"

    if total == 0:
        return (
            "Manche difficile ! Regarde bien les logos qui se dézooment, tu vas y arriver."
            if fr
            else "Tough round! Watch the logos closely as they zoom out and you'll get there."
        )
    if best[1] == worst[1]:
        return (
            f"Belle régularité : {best[1]}/100 partout. Rang : {p.rank_title}."
            if fr
            else f"Nicely balanced: {best[1]}/100 in every game. Rank: {p.rank_title}."
        )
    if fr:
        return (
            f"Ton point fort : {best[0]} ({best[1]}/100). "
            f"{worst[0]} ({worst[1]}/100) a le plus de marge de progression. Rang : {p.rank_title}."
        )
    return (
        f"Your strongest game was {best[0]} ({best[1]}/100). "
        f"{worst[0]} ({worst[1]}/100) has the most room to improve. Rank: {p.rank_title}."
    )


async def _ask_gemini(p: AIAnalysisRequest, transport: Optional[httpx.AsyncBaseTransport]) -> str:
    url = GEMINI_URL.format(model=settings.GEMINI_MODEL)
    headers = {"x-goog-api-key": settings.GEMINI_API_KEY, "Content-Type": "application/json"}

    async with httpx.AsyncClient(timeout=settings.GEMINI_TIMEOUT_SEC, transport=transport) as client:
        response = await client.post(url, headers=headers, json=_build_body(p, low_thinking=True))
        if response.status_code == 400:
            # Certains modèles refusent thinkingConfig : on réessaie une fois sans.
            response = await client.post(url, headers=headers, json=_build_body(p, low_thinking=False))

    if response.status_code != 200:
        raise RuntimeError(f"HTTP {response.status_code} : {response.text[:200]}")

    text = _clean(_extract_text(response.json()))
    if not text:
        raise RuntimeError("réponse vide")
    return text


async def generate_feedback(
    p: AIAnalysisRequest, *, transport: Optional[httpx.AsyncBaseTransport] = None
) -> tuple[str, Literal["gemini", "fallback"]]:
    """Retourne (texte, source). Ne lève jamais : en cas de souci, on renvoie le commentaire local."""
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY absente de backend/.env : commentaire local utilisé.")
        return fallback_comment(p), "fallback"
    try:
        return await _ask_gemini(p, transport), "gemini"
    except Exception as exc:  # réseau, quota (429), modèle inconnu, clé invalide, réponse vide...
        # Erreurs "normales" (HTTP, réseau) : un message suffit. Bug de code inattendu : traceback complet dans le terminal.
        expected = isinstance(exc, (RuntimeError, httpx.HTTPError))
        logger.warning(
            "Gemini indisponible (%s: %s) : commentaire local utilisé.", type(exc).__name__, exc, exc_info=not expected
        )
        return fallback_comment(p), "fallback"
