from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_url: str
    secret_key: str
    discord_client_id: str
    discord_client_secret: str
    discord_redirect_uri: str
    mongo_initdb_root_username: str
    mongo_initdb_root_password: str
    omdb_api_key: str

    class Config:
        env_file = "../../.env"

    @property
    def mongodb_connection_string(self):
        return f"mongodb://{self.mongo_initdb_root_username}:{self.mongo_initdb_root_password}@{self.mongodb_url}"

settings = Settings()
