from fastapi import APIRouter, Depends, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import List
from app.auth import get_current_user
from app.models import UserModel, ListModel, ListItemModel
from app.config import settings

router = APIRouter()

async def get_database(request: Request) -> AsyncIOMotorClient:
    return request.app.mongodb

@router.post("/lists", response_model=ListModel)
async def create_list(
    list_data: ListModel,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to create lists")
    
    list_data.owner_id = str(current_user.id)
    result = await db.lists.insert_one(list_data.dict(exclude={"id"}))
    created_list = await db.lists.find_one({"_id": result.inserted_id})
    return ListModel(**created_list)

@router.get("/lists/{list_id}", response_model=ListModel)
async def get_list(list_id: str, current_user: UserModel = Depends(get_current_user), db: AsyncIOMotorClient = Depends(get_database)):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to view lists")
    
    list_data = await db.lists.find_one({"_id": ObjectId(list_id), "owner_id": current_user.discord_id})
    if list_data is None:
        raise HTTPException(status_code=404, detail="List not found")
    return ListModel(**list_data)

@router.put("/lists/{list_id}", response_model=ListModel)
async def update_list(list_id: str, list_data: ListModel, current_user: UserModel = Depends(get_current_user), db: AsyncIOMotorClient = Depends(get_database)):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to update lists")
    
    existing_list = await db.lists.find_one({"_id": ObjectId(list_id), "owner_id": current_user.discord_id})
    if existing_list is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    update_data = list_data.dict(exclude={"id", "owner_id"})
    await db.lists.update_one({"_id": ObjectId(list_id)}, {"$set": update_data})
    updated_list = await db.lists.find_one({"_id": ObjectId(list_id)})
    return ListModel(**updated_list)

@router.delete("/lists/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_list(list_id: str, current_user: UserModel = Depends(get_current_user), db: AsyncIOMotorClient = Depends(get_database)):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to delete lists")
    
    result = await db.lists.delete_one({"_id": ObjectId(list_id), "owner_id": current_user.discord_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="List not found")
    return

# List Items CRUD operations

@router.post("/lists/{list_id}/items", response_model=ListItemModel)
async def create_list_item(list_id: str, item_data: ListItemModel, current_user: UserModel = Depends(get_current_user), db: AsyncIOMotorClient = Depends(get_database)):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to create list items")
    
    list_data = await db.lists.find_one({"_id": ObjectId(list_id), "owner_id": current_user.discord_id})
    if list_data is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    item_data.list_id = ObjectId(list_id)
    result = await db.list_items.insert_one(item_data.dict(exclude={"id"}))
    created_item = await db.list_items.find_one({"_id": result.inserted_id})
    return ListItemModel(**created_item)

@router.get("/lists/{list_id}/items", response_model=List[ListItemModel])
async def get_list_items(list_id: str, current_user: UserModel = Depends(get_current_user), db: AsyncIOMotorClient = Depends(get_database)):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to view list items")
    
    list_data = await db.lists.find_one({"_id": ObjectId(list_id), "owner_id": current_user.discord_id})
    if list_data is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    items = await db.list_items.find({"list_id": ObjectId(list_id)}).to_list(length=None)
    return [ListItemModel(**item_data) for item_data in items]

@router.put("/lists/{list_id}/items/{item_id}", response_model=ListItemModel)
async def update_list_item(list_id: str, item_id: str, item_data: ListItemModel, current_user: UserModel = Depends(get_current_user), db: AsyncIOMotorClient = Depends(get_database)):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to update list items")
    
    list_data = await db.lists.find_one({"_id": ObjectId(list_id), "owner_id": current_user.discord_id})
    if list_data is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    existing_item = await db.list_items.find_one({"_id": ObjectId(item_id), "list_id": ObjectId(list_id)})
    if existing_item is None:
        raise HTTPException(status_code=404, detail="List item not found")
    
    update_data = item_data.dict(exclude={"id", "list_id"})
    await db.list_items.update_one({"_id": ObjectId(item_id)}, {"$set": update_data})
    updated_item = await db.list_items.find_one({"_id": ObjectId(item_id)})
    return ListItemModel(**updated_item)

@router.delete("/lists/{list_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_list_item(list_id: str, item_id: str, current_user: UserModel = Depends(get_current_user), db: AsyncIOMotorClient = Depends(get_database)):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to delete list items")
    
    list_data = await db.lists.find_one({"_id": ObjectId(list_id), "owner_id": current_user.discord_id})
    if list_data is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    result = await db.list_items.delete_one({"_id": ObjectId(item_id), "list_id": ObjectId(list_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="List item not found")
    return

# Rating endpoint

@router.post("/lists/{list_id}/items/{item_id}/rate", response_model=ListItemModel)
async def rate_list_item(list_id: str, item_id: str, rating: int, current_user: UserModel = Depends(get_current_user), db: AsyncIOMotorClient = Depends(get_database)):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to rate list items")
    
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    list_data = await db.lists.find_one({"_id": ObjectId(list_id), "owner_id": current_user.discord_id})
    if list_data is None:
        raise HTTPException(status_code=404, detail="List not found")
    
    existing_item = await db.list_items.find_one({"_id": ObjectId(item_id), "list_id": ObjectId(list_id)})
    if existing_item is None:
        raise HTTPException(status_code=404, detail="List item not found")
    
    await db.list_items.update_one({"_id": ObjectId(item_id)}, {"$set": {"rating": rating}})
    updated_item = await db.list_items.find_one({"_id": ObjectId(item_id)})
    return ListItemModel(**updated_item)
