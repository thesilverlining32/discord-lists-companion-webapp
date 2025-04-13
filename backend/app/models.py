from bson import ObjectId
from typing import Optional, Dict, Any, List, Literal
from enum import Enum
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
        return core_schema.union_schema([
            core_schema.str_schema(),
            core_schema.is_instance_schema(ObjectId),
        ])

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
        from_attributes=True
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

class PermissionLevel(str, Enum):
    READ = "read"
    CREATE = "create"
    EDIT = "edit"
    DELETE = "delete"

class UserPermission(BaseModel):
    user_id: str
    username: Optional[str] = None  # Store username for display purposes
    permission_level: PermissionLevel = PermissionLevel.READ

    model_config = ConfigDict(
        populate_by_name=True,
        use_enum_values=True
    )

class ListModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str
    description: Optional[str] = ""
    owner_id: str
    item_count: Optional[int] = 0
    is_public: bool = False
    shared_with: Optional[List[UserPermission]] = Field(default_factory=list)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
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
    position: Optional[int] = 0  # Add position field with default value of 0

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        from_attributes=True
    )

class ListCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(default="")
    is_public: Optional[bool] = Field(default=False)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class ShareListRequest(BaseModel):
    user_id: str
    permission_level: PermissionLevel = PermissionLevel.READ

    model_config = ConfigDict(
        populate_by_name=True,
        use_enum_values=True
    )

class ItemOrderData(BaseModel):
    # Use an alias to accept 'item_id' while using 'id' internally
    id: str = Field(alias='item_id', description="ID of the item to reorder")
    position: int = Field(description="New position of the item")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class ReorderItemsRequest(BaseModel):
    items: List[ItemOrderData]

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
