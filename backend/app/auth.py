from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2AuthorizationCodeBearer
from fastapi.responses import RedirectResponse
from app.config import settings
from jose import jwt, JWTError
from datetime import datetime, timedelta
import httpx
from app.models import UserModel
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Dict, Any, Optional

router = APIRouter()

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://discord.com/api/oauth2/authorize",
    tokenUrl="https://discord.com/api/oauth2/token",
)

async def get_user_by_discord_id(db: AsyncIOMotorClient, discord_id: str) -> Optional[UserModel]:
    user_data = await db.users.find_one({"discord_id": discord_id})
    return UserModel.from_mongo(user_data) if user_data else None

async def create_or_update_user(db: AsyncIOMotorClient, user_data: Dict[str, Any]) -> UserModel:
    user = await get_user_by_discord_id(db, user_data["id"])
    if user:
        # Update existing user
        update_data = {
            "username": user_data["username"],
            "email": user_data["email"],
            "avatar": user_data.get("avatar")
        }
        await db.users.update_one({"discord_id": user_data["id"]}, {"$set": update_data})
        user.username = user_data["username"]
        user.email = user_data["email"]
        user.avatar = user_data.get("avatar")
    else:
        # Create new user
        user = UserModel(
            discord_id=user_data["id"],
            username=user_data["username"],
            email=user_data["email"],
            avatar=user_data.get("avatar"),
            is_approved=False  # New users are not approved by default
        )
        await db.users.insert_one(user.to_mongo())
    return user

def create_access_token(data: Dict[str, Any], expires_delta: timedelta = timedelta(minutes=15)) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")

async def get_current_user(token: str = Depends(oauth2_scheme), request: Request = None):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        discord_id: str = payload.get("sub")
        if discord_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    if request is None or not hasattr(request, 'app') or not hasattr(request.app, 'mongodb'):
        raise HTTPException(status_code=500, detail="Database connection not available")

    db = request.app.mongodb
    user = await get_user_by_discord_id(db, discord_id)
    if user is None:
        raise credentials_exception
    return user

@router.get("/login")
async def login_discord():
    login_url = f"https://discord.com/api/oauth2/authorize?client_id={settings.discord_client_id}&redirect_uri={settings.discord_redirect_uri}&response_type=code&scope=identify%20email"
    print(f"Generated Discord login URL: {login_url}")
    return {"url": login_url}

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

    # After creating the access token
    frontend_url = settings.react_app_frontend_url
    redirect_url = f"{frontend_url}/auth/callback?token={access_token}"

    return RedirectResponse(url=redirect_url)

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

    return user.model_dump()

# Example protected route
@router.get("/protected")
async def protected_route(current_user: UserModel = Depends(get_current_user)):
    return {"message": "This is a protected route", "user": current_user.model_dump(exclude={"id"})}
