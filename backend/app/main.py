from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from app.auth import router as auth_router
from app.lists import router as lists_router
from app.config import settings

app = FastAPI()

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(lists_router, prefix="/api", tags=["lists"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
