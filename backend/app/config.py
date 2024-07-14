# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_url: str
    secret_key: str
    discord_client_id: str
    discord_client_secret: str
    discord_redirect_uri: str

    class Config:
        env_file = "../.env"

settings = Settings()
