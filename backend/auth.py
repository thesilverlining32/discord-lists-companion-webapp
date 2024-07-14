from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from pydantic import BaseModel
from jose import jwt
import httpx
from .config import settings

router = APIRouter()

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://discord.com/api/oauth2/authorize",
    tokenUrl="https://discord.com/api/oauth2/token",
)

class Token(BaseModel):
    access_token: str
    token_type: str

@router.get("/login")
async def login_discord():
    return {
        "url": f"https://discord.com/api/oauth2/authorize?client_id={settings.discord_client_id}&redirect_uri={settings.discord_redirect_uri}&response_type=code&scope=identify%20email"
    }

@router.get("/callback")
async def auth_callback(code: str):
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
    
    # Here you would typically create or update the user in your database
    # and create a session or JWT token for your app
    
    return {"message": "Authentication successful", "user": user_data}

@router.get("/me")
async def read_users_me(token: str = Depends(oauth2_scheme)):
    # Here you would typically validate the token and return the user info
    return {"token": token}