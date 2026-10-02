from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.MONGODB_URI)
db = client.get_database("tech_quiz_db")  

# Collections
zoom_collection = db.get_collection("zoom_rounds")
connections_collection = db.get_collection("connections_rounds")
timeline_collection = db.get_collection("timeline_rounds")