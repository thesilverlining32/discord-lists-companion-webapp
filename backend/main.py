from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_url: str
    secret_key: str

    class Config:
        env_file = "../.env"

settings = Settings()

app = FastAPI()

@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(settings.mongodb_url)
    app.mongodb = app.mongodb_client.idea_list_db

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

@app.get("/")
async def root():
    return {"message": "Welcome to the Idea List API"}