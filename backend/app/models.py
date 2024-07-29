from bson import ObjectId
from typing import Optional, Dict, Any

class UserModel:
    def __init__(self, discord_id: str, username: str, email: str, avatar: Optional[str] = None, 
                 is_admin: bool = False, is_approved: bool = False, _id: Optional[ObjectId] = None):
        self._id = _id or ObjectId()
        self.discord_id = discord_id
        self.username = username
        self.email = email
        self.avatar = avatar
        self.is_admin = is_admin
        self.is_approved = is_approved

    @classmethod
    def from_mongo(cls, data: Dict[str, Any]) -> Optional['UserModel']:
        if not data:
            return None
        return cls(
            discord_id=data['discord_id'],
            username=data['username'],
            email=data['email'],
            avatar=data.get('avatar'),
            is_admin=data.get('is_admin', False),
            is_approved=data.get('is_approved', False),
            _id=data.get('_id')
        )

    def to_mongo(self) -> Dict[str, Any]:
        return {
            '_id': self._id,
            'discord_id': self.discord_id,
            'username': self.username,
            'email': self.email,
            'avatar': self.avatar,
            'is_admin': self.is_admin,
            'is_approved': self.is_approved
        }

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': str(self._id),
            'discord_id': self.discord_id,
            'username': self.username,
            'email': self.email,
            'avatar': self.avatar,
            'is_admin': self.is_admin,
            'is_approved': self.is_approved
        }
