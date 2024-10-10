from pydantic_settings import BaseSettings
from typing import List
from urllib.parse import urlparse

class Settings(BaseSettings):
    mongodb_url: str
    secret_key: str
    discord_client_id: str
    discord_client_secret: str
    discord_redirect_uri: str
    mongo_initdb_root_username: str
    mongo_initdb_root_password: str
    omdb_api_key: str
    react_app_api_url: str
    react_app_frontend_url: str

    class Config:
        env_file = "../.env"

    @property
    def mongodb_connection_string(self):
        return f"mongodb://{self.mongo_initdb_root_username}:{self.mongo_initdb_root_password}@{self.mongodb_url}"

    @property
    def cors_origins(self) -> List[str]:
        origins = [self.react_app_frontend_url]
        api_origin = urlparse(self.react_app_api_url).netloc
        if api_origin not in origins:
            origins.append(f"http://{api_origin}")
            origins.append(f"https://{api_origin}")
        return origins

settings = Settings()
