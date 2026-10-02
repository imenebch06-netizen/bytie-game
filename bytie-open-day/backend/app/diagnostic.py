"""Diagnostic en une commande (depuis backend/, venv activé) :  python -m app.diagnostic

Vérifie ce que VOTRE installation voit réellement : base MongoDB, clé Gemini, appel Gemini en direct,
et fichiers du projet restés en ancienne version.
"""
import asyncio
import traceback

from app.config import BASE_DIR, settings
from app.database import connections_collection, db, timeline_collection, zoom_collection
from app.schemas import AIAnalysisRequest
from app.services import ai_feedback

OK, KO = "[OK]", "[PROBLEME]"


async def check_mongo() -> None:
    print("\n1) MongoDB")
    print(f"   Base utilisée par l'API : {db.name}  ({settings.MONGODB_URI})")
    collections = (
        ("zoom_rounds", zoom_collection),
        ("connections_rounds", connections_collection),
        ("timeline_rounds", timeline_collection),
    )
    for label, coll in collections:
        try:
            n = await coll.count_documents({})
        except Exception as exc:
            print(f"   {KO} {label} : MongoDB injoignable ({type(exc).__name__}). Est-il démarré ?")
            return
        print(f"   {OK if n else KO} {label} : {n} document(s)")
    ids = [d.get("id") async for d in connections_collection.find({}, {"id": 1})]
    print(f"   Grilles Connections en base : {ids}")
    print("   -> Si une seule grille est listée, relancez : python -m app.seed_db")


async def check_gemini() -> None:
    print("\n2) Gemini")
    print(f"   Modèle : {settings.GEMINI_MODEL}")
    if not settings.GEMINI_API_KEY:
        print(f"   {KO} GEMINI_API_KEY est vide : ajoutez-la dans {BASE_DIR / '.env'}")
        return
    print(f"   {OK} Clé présente ({len(settings.GEMINI_API_KEY)} caractères)")
    sample = AIAnalysisRequest(zoom_score=85, connections_score=40, timeline_score=70, rank_title="INTERMEDIATE", language="en")
    try:
        text = await ai_feedback._ask_gemini(sample, None)
        print(f"   {OK} Appel réussi. Réponse de Gemini :\n      {text}")
    except Exception:
        print(f"   {KO} L'appel a échoué. Erreur exacte :")
        print("      " + traceback.format_exc().strip().replace("\n", "\n      "))


def check_stale_files() -> None:
    needle = "total" + "_score"  # ancien nom de champ, supprimé du projet (écrit en deux morceaux pour ne pas se détecter soi-même)
    print(f'\n3) Fichiers restés en ancienne version ("{needle}" n\'existe plus nulle part)')
    roots = [BASE_DIR / "app", BASE_DIR.parent / "jeu-mascotte" / "src"]
    found = []
    for root in roots:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if path.suffix in {".py", ".ts", ".tsx"} and "__pycache__" not in path.parts:
                if needle in path.read_text(encoding="utf-8", errors="ignore"):
                    found.append(path)
    if found:
        for path in found:
            print(f"   {KO} {path}")
        print("   -> Remplacez ces fichiers par ceux du zip.")
    else:
        print(f"   {OK} Aucun fichier ancien trouvé")


async def main() -> None:
    print(f"Dossier backend : {BASE_DIR}")
    await check_mongo()
    await check_gemini()
    check_stale_files()


if __name__ == "__main__":
    asyncio.run(main())
