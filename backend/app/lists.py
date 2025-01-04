from fastapi import APIRouter, Depends, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import List
from app.auth import get_current_user
from app.models import UserModel, ListModel, ListItemModel, ListCreateRequest
from app.config import settings

router = APIRouter()

async def get_database(request: Request) -> AsyncIOMotorClient:
    return request.app.mongodb

@router.get("/lists", response_model=List[ListModel])
async def get_user_lists(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to view lists")

    # Get all lists for the user
    cursor = db.lists.find({"owner_id": str(current_user.id)})
    lists = await cursor.to_list(length=None)

    # Get item counts for each list and prepare response
    response_lists = []
    for list_data in lists:
        list_id = str(list_data["_id"])
        item_count = await db.list_items.count_documents({"list_id": list_id})
        # Create a copy of list_data and add item_count
        list_with_count = dict(list_data)
        list_with_count["item_count"] = item_count
        response_lists.append(ListModel(**list_with_count))

    return response_lists

@router.post("/lists", response_model=ListModel, status_code=status.HTTP_201_CREATED)
async def create_list(
    list_data: ListCreateRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not approved to create lists"
        )

    try:
        new_list = {
            "name": list_data.name,
            "description": list_data.description,
            "owner_id": str(current_user.id)
        }

        result = await db.lists.insert_one(new_list)
        created_list = await db.lists.find_one({"_id": result.inserted_id})

        if created_list is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create list"
            )

        return ListModel(**created_list)

    except Exception as e:
        print(f"Error creating list: {str(e)}")  # Add this for debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create list: {str(e)}"
        )

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

@router.get("/lists/{list_id}", response_model=ListModel)
async def get_list(
    list_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not approved to view lists"
        )

    try:
        # Convert string ID to ObjectId
        list_object_id = ObjectId(list_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid list ID format"
        )

    list_data = await db.lists.find_one({
        "_id": list_object_id,
        "owner_id": str(current_user.id)
    })

    if list_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )

    return ListModel(**list_data)

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
async def create_list_item(
    list_id: str,
    item: ListItemModel,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to create list items")

    list_data = await db.lists.find_one({"_id": ObjectId(list_id), "owner_id": str(current_user.id)})
    if list_data is None:
        raise HTTPException(status_code=404, detail="List not found")

    item.list_id = list_id
    result = await db.list_items.insert_one(item.dict(exclude={"id"}))
    created_item = await db.list_items.find_one({"_id": result.inserted_id})
    return ListItemModel(**created_item)

@router.get("/lists/{list_id}/items", response_model=List[ListItemModel])
async def get_list_items(list_id: str, current_user: UserModel = Depends(get_current_user), db: AsyncIOMotorClient = Depends(get_database)):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to view list items")

    list_data = await db.lists.find_one({"_id": ObjectId(list_id), "owner_id": str(current_user.id)})
    if list_data is None:
        raise HTTPException(status_code=404, detail="List not found")

    items = await db.list_items.find({"list_id": list_id}).to_list(length=None)
    return [ListItemModel(**item_data) for item_data in items]

@router.put("/lists/{list_id}/items/{item_id}", response_model=ListItemModel)
async def update_list_item(
    list_id: str,
    item_id: str,
    item_update: ListItemModel,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to update list items")

    list_data = await db.lists.find_one({"_id": ObjectId(list_id), "owner_id": str(current_user.id)})
    if list_data is None:
        raise HTTPException(status_code=404, detail="List not found")

    update_result = await db.list_items.update_one(
        {"_id": ObjectId(item_id), "list_id": list_id},
        {"$set": item_update.dict(exclude={"id", "list_id"})}
    )

    if update_result.modified_count == 0:
        raise HTTPException(status_code=404, detail="List item not found")

    updated_item = await db.list_items.find_one({"_id": ObjectId(item_id)})
    return ListItemModel(**updated_item)

@router.delete("/lists/{list_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_list_item(
    list_id: str,
    item_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to delete list items")

    list_data = await db.lists.find_one({"_id": ObjectId(list_id), "owner_id": str(current_user.id)})
    if list_data is None:
        raise HTTPException(status_code=404, detail="List not found")

    delete_result = await db.list_items.delete_one({"_id": ObjectId(item_id), "list_id": list_id})

    if delete_result.deleted_count == 0:
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
