from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from app.auth import router as auth_router
from app.config import settings

app = FastAPI()

app.include_router(auth_router, prefix="/auth", tags=["auth"])

@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(settings.mongodb_connection_string)
    app.mongodb = app.mongodb_client.idea_list_db

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

@app.get("/")
async def root():
    return {"message": "Welcome to the Idea List API"}
