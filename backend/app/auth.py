from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2AuthorizationCodeBearer
from pydantic import BaseModel
from jose import jwt, JWTError
from datetime import datetime, timedelta
import httpx
from app.config import settings
from app.models import UserModel
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://discord.com/api/oauth2/authorize",
    tokenUrl="https://discord.com/api/oauth2/token",
)

class Token(BaseModel):
    access_token: str
    token_type: str

async def get_user_by_discord_id(db: AsyncIOMotorClient, discord_id: str):
    user = await db.users.find_one({"discord_id": discord_id})
    if user:
        return UserModel.from_mongo(user)
    return None

async def create_or_update_user(db: AsyncIOMotorClient, user_data: dict):
    user = await get_user_by_discord_id(db, user_data["id"])
    if user:
        # Update existing user
        user.username = user_data["username"]
        user.email = user_data["email"]
        user.avatar = user_data.get("avatar")
        await db.users.update_one({"discord_id": user_data["id"]}, {"$set": user.to_mongo()})
    else:
        # Create new user
        new_user = UserModel(
            discord_id=user_data["id"],
            username=user_data["username"],
            email=user_data["email"],
            avatar=user_data.get("avatar"),
            is_approved=False  # New users are not approved by default
        )
        await db.users.insert_one(new_user.to_mongo())
    return await get_user_by_discord_id(db, user_data["id"])

def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=15)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm="HS256")
    return encoded_jwt

@router.get("/login")
async def login_discord():
    return {
        "url": f"https://discord.com/api/oauth2/authorize?client_id={settings.discord_client_id}&redirect_uri={settings.discord_redirect_uri}&response_type=code&scope=identify%20email"
    }

@router.get("/callback")
async def auth_callback(request: Request, code: str):
    data = {
        "client_id": settings.discord_client_id,
        "client_secret": settings.discord_client_secret,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.discord_redirect_uri,
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    
    async with httpx.AsyncClient() as client:
        response = await client.post("https://discord.com/api/oauth2/token", data=data, headers=headers)
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Could not retrieve token")
    
    token_data = response.json()
    access_token = token_data["access_token"]
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://discord.com/api/users/@me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Could not retrieve user info")
    
    user_data = response.json()
    
    # Create or update user in the database
    user = await create_or_update_user(request.app.mongodb, user_data)
    
    # Create access token for our app
    access_token = create_access_token(
        data={"sub": user.discord_id},
        expires_delta=timedelta(minutes=30)
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def read_users_me(request: Request, token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        discord_id = payload.get("sub")
        if discord_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await get_user_by_discord_id(request.app.mongodb, discord_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
