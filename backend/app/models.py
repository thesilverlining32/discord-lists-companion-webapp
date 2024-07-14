from pydantic import BaseModel, Field
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
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        return {
            'type': 'custom',
            'typename': 'ObjectId',
            'validator': lambda v: str(v),
        }

class UserModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    discord_id: str
    username: str
    email: str
    avatar: Optional[str] = None
    is_admin: bool = False
    is_approved: bool = False

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
