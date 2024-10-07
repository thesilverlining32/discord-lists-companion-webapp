from bson import ObjectId
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict
from pydantic_core import core_schema

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.is_instance_schema(ObjectId),
            serialization=core_schema.to_string_serializer(),
        )

class UserModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    discord_id: str
    username: str
    email: str
    avatar: Optional[str] = None
    is_admin: bool = False
    is_approved: bool = False

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        use_enum_values=True
    )

    @classmethod
    def from_mongo(cls, data: Dict[str, Any]) -> Optional['UserModel']:
        if not data:
            return None
        data["id"] = data.pop("_id")
        return cls.model_validate(data)

    def to_mongo(self) -> Dict[str, Any]:
        data = self.model_dump(by_alias=True, exclude={"id"})
        if self.id:
            data["_id"] = self.id
        return data

class ListModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str
    description: Optional[str] = None
    owner_id: str

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        use_enum_values=True
    )

class ListItemModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    list_id: str
    type: str  # "Movie", "Game", "Book", "Comic", or "Custom"
    title: str
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None
    rating: Optional[int] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        use_enum_values=True
    )
