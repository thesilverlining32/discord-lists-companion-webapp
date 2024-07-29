from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

class MongoBaseModel(BaseModel):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
        json_encoders={ObjectId: str}
    )

class UserModel(MongoBaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    discord_id: str
    username: str
    email: str
    avatar: Optional[str] = None
    is_admin: bool = False
    is_approved: bool = False

    @classmethod
    def from_mongo(cls, data: dict):
        """Convert MongoDB result to Pydantic model."""
        if not data:
            return None
        data_cp = data.copy()
        data_cp["id"] = data_cp.pop("_id", None)
        return cls.model_validate(data_cp)

    def to_mongo(self):
        """Convert Pydantic model to MongoDB format."""
        data = self.model_dump(by_alias=True, exclude_none=True)
        if data.get("_id") is None:
            data.pop("_id", None)
        return data
