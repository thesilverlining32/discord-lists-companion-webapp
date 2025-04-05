from fastapi import APIRouter, Depends, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import List, Optional
from app.auth import get_current_user
from app.models import UserModel, ListModel, ListItemModel, ListCreateRequest, UserPermission, ShareListRequest, PermissionLevel
from app.config import settings

router = APIRouter()

async def get_database(request: Request) -> AsyncIOMotorClient:
    return request.app.mongodb

# Helper function to check if a user has sufficient permissions for a list
async def check_list_permissions(db, list_id: str, user_id: str, required_permission: PermissionLevel) -> bool:
    list_data = await db.lists.find_one({"_id": ObjectId(list_id)})

    if not list_data:
        return False

    # Owner has all permissions
    if list_data["owner_id"] == user_id:
        return True

    # Check if list is public
    if list_data.get("is_public", False) and required_permission == PermissionLevel.READ:
        return True

    # Check shared permissions
    shared_with = list_data.get("shared_with", [])
    for permission in shared_with:
        if permission["user_id"] == user_id:
            # Check if the permission level is sufficient
            user_permission = permission["permission_level"]

            # Permission hierarchy: DELETE > EDIT > CREATE > READ
            if user_permission == PermissionLevel.DELETE:
                return True
            elif user_permission == PermissionLevel.EDIT and required_permission in [PermissionLevel.EDIT, PermissionLevel.CREATE, PermissionLevel.READ]:
                return True
            elif user_permission == PermissionLevel.CREATE and required_permission in [PermissionLevel.CREATE, PermissionLevel.READ]:
                return True
            elif user_permission == PermissionLevel.READ and required_permission == PermissionLevel.READ:
                return True

    return False

@router.get("/lists", response_model=List[ListModel])
async def get_user_lists(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to view lists")

    # Get all lists owned by the user
    cursor = db.lists.find({"owner_id": str(current_user.id)})
    owned_lists = await cursor.to_list(length=None)

    # Get all lists shared with the user
    cursor = db.lists.find({"shared_with.user_id": str(current_user.id)})
    shared_lists = await cursor.to_list(length=None)

    # Get all public lists
    cursor = db.lists.find({"is_public": True})
    public_lists = await cursor.to_list(length=None)

    # Combine all lists, avoiding duplicates
    all_lists_ids = set()
    response_lists = []

    for lists in [owned_lists, shared_lists, public_lists]:
        for list_data in lists:
            list_id = str(list_data["_id"])
            if list_id not in all_lists_ids:
                all_lists_ids.add(list_id)

                # Get item count for the list
                item_count = await db.list_items.count_documents({"list_id": list_id})
                list_data["item_count"] = item_count

                response_lists.append(ListModel(**list_data))

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
        # Important: Print debug information to see what ID is actually being used
        print(f"Creating list with user ID: {current_user.id}")

        new_list = {
            "name": list_data.name,
            "description": list_data.description,
            "owner_id": str(current_user.id),  # Use the _id from UserModel as a string
            "is_public": list_data.is_public,
            "shared_with": []
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
        print(f"Error creating list: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create list: {str(e)}"
        )

@router.put("/lists/{list_id}", response_model=ListModel)
async def update_list(
    list_id: str,
    list_data: ListModel,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to update lists")

    # Check if the user has permission to edit the list
    has_permission = await check_list_permissions(db, list_id, str(current_user.id), PermissionLevel.EDIT)
    if not has_permission:
        raise HTTPException(status_code=403, detail="User does not have permission to edit this list")

    # Ensure the owner cannot be changed
    existing_list = await db.lists.find_one({"_id": ObjectId(list_id)})
    if not existing_list:
        raise HTTPException(status_code=404, detail="List not found")

    update_data = list_data.dict(exclude={"id", "owner_id", "shared_with"})
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

    list_data = await db.lists.find_one({"_id": list_object_id})

    if list_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )

    # Check if user has read permission for this list
    has_permission = await check_list_permissions(db, list_id, str(current_user.id), PermissionLevel.READ)
    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have permission to view this list"
        )

    return ListModel(**list_data)

@router.delete("/lists/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_list(
    list_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to delete lists")

    # Check if user is the owner or has delete permission
    list_data = await db.lists.find_one({"_id": ObjectId(list_id)})
    if not list_data:
        raise HTTPException(status_code=404, detail="List not found")

    # Only allow owner to delete the list
    if list_data["owner_id"] != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only the list owner can delete a list")

    # Delete the list and all its items
    await db.lists.delete_one({"_id": ObjectId(list_id)})
    await db.list_items.delete_many({"list_id": list_id})
    return

# Sharing endpoints

@router.post("/lists/{list_id}/share", response_model=ListModel)
async def share_list(
    list_id: str,
    share_data: ShareListRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to share lists")

    # Check if the current user is the owner of the list
    list_data = await db.lists.find_one({"_id": ObjectId(list_id)})
    if not list_data:
        raise HTTPException(status_code=404, detail="List not found")

    if list_data["owner_id"] != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only the list owner can share the list")

    # Check if the target user exists and is approved
    target_user = await db.users.find_one({"_id": ObjectId(share_data.user_id)})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not target_user.get("is_approved", False):
        raise HTTPException(status_code=403, detail="Cannot share with non-approved users")

    # Don't allow sharing with yourself
    if str(target_user["_id"]) == str(current_user.id):
        raise HTTPException(status_code=400, detail="Cannot share a list with yourself")

    # Check if the user already has permissions for this list
    shared_with = list_data.get("shared_with", [])
    for idx, permission in enumerate(shared_with):
        if permission["user_id"] == share_data.user_id:
            # Update existing permission
            shared_with[idx]["permission_level"] = share_data.permission_level
            await db.lists.update_one(
                {"_id": ObjectId(list_id)},
                {"$set": {"shared_with": shared_with}}
            )
            updated_list = await db.lists.find_one({"_id": ObjectId(list_id)})
            return ListModel(**updated_list)

    # Add new permission
    new_permission = UserPermission(
        user_id=share_data.user_id,
        username=target_user.get("username", "Unknown User"),
        permission_level=share_data.permission_level
    )

    await db.lists.update_one(
        {"_id": ObjectId(list_id)},
        {"$push": {"shared_with": new_permission.dict()}}
    )

    updated_list = await db.lists.find_one({"_id": ObjectId(list_id)})
    return ListModel(**updated_list)

@router.delete("/lists/{list_id}/share/{user_id}", status_code=status.HTTP_200_OK, response_model=ListModel)
async def remove_list_sharing(
    list_id: str,
    user_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to modify list sharing")

    # Check if the current user is the owner of the list
    list_data = await db.lists.find_one({"_id": ObjectId(list_id)})
    if not list_data:
        raise HTTPException(status_code=404, detail="List not found")

    if list_data["owner_id"] != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only the list owner can modify sharing settings")

    # Remove the user from the shared_with array
    await db.lists.update_one(
        {"_id": ObjectId(list_id)},
        {"$pull": {"shared_with": {"user_id": user_id}}}
    )

    updated_list = await db.lists.find_one({"_id": ObjectId(list_id)})
    return ListModel(**updated_list)

@router.get("/lists/{list_id}/share", response_model=List[UserPermission])
async def get_list_shares(
    list_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to view list sharing information")

    # Check if the current user is the owner of the list
    list_data = await db.lists.find_one({"_id": ObjectId(list_id)})
    if not list_data:
        raise HTTPException(status_code=404, detail="List not found")

    # Only allow owner to see sharing information
    if list_data["owner_id"] != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only the list owner can view sharing information")

    shared_with = list_data.get("shared_with", [])
    return [UserPermission(**permission) for permission in shared_with]

@router.put("/lists/{list_id}/public", response_model=ListModel)
async def set_list_public(
    list_id: str,
    is_public: bool,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to modify list visibility")

    # Check if the current user is the owner of the list
    list_data = await db.lists.find_one({"_id": ObjectId(list_id)})
    if not list_data:
        raise HTTPException(status_code=404, detail="List not found")

    if list_data["owner_id"] != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only the list owner can modify list visibility")

    await db.lists.update_one(
        {"_id": ObjectId(list_id)},
        {"$set": {"is_public": is_public}}
    )

    updated_list = await db.lists.find_one({"_id": ObjectId(list_id)})
    return ListModel(**updated_list)

# List Items CRUD operations - Updated to check permissions

@router.post("/lists/{list_id}/items", response_model=ListItemModel, status_code=status.HTTP_201_CREATED)
async def create_list_item(
    list_id: str,
    item: ListItemModel,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to create list items")

    # Check if user has create permission for this list
    has_permission = await check_list_permissions(db, list_id, str(current_user.id), PermissionLevel.CREATE)
    if not has_permission:
        raise HTTPException(status_code=403, detail="User does not have permission to add items to this list")

    try:
        # Get the maximum position value to append to the end
        cursor = db.list_items.find({"list_id": list_id}).sort("position", -1).limit(1)
        highest_items = await cursor.to_list(length=1)

        max_position = 0
        if highest_items:
            max_position = highest_items[0].get("position", 0) + 1

        # Set position and list_id
        item.list_id = list_id
        item.position = max_position

        # Insert the item
        item_dict = item.dict(exclude={"id"})
        result = await db.list_items.insert_one(item_dict)
        created_item = await db.list_items.find_one({"_id": result.inserted_id})

        return ListItemModel(**created_item)
    except Exception as e:
        print(f"Error creating list item: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create list item: {str(e)}"
        )


@router.get("/lists/{list_id}/items", response_model=List[ListItemModel])
async def get_list_items(
    list_id: str,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to view list items")

    # Check if user has read permission for this list
    has_permission = await check_list_permissions(db, list_id, str(current_user.id), PermissionLevel.READ)
    if not has_permission:
        raise HTTPException(status_code=403, detail="User does not have permission to view items in this list")

    try:
        # Get all items for this list and sort by position
        cursor = db.list_items.find({"list_id": list_id}).sort("position", 1)
        items = await cursor.to_list(length=None)

        return [ListItemModel(**item_data) for item_data in items]
    except Exception as e:
        print(f"Error fetching list items: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch list items: {str(e)}"
        )

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

    # Check if user has edit permission for this list
    has_permission = await check_list_permissions(db, list_id, str(current_user.id), PermissionLevel.EDIT)
    if not has_permission:
        raise HTTPException(status_code=403, detail="User does not have permission to edit items in this list")

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

    # Check if user has delete permission for this list
    has_permission = await check_list_permissions(db, list_id, str(current_user.id), PermissionLevel.DELETE)
    if not has_permission:
        raise HTTPException(status_code=403, detail="User does not have permission to delete items from this list")

    try:
        # Find the item to get its position
        item_to_delete = await db.list_items.find_one({"_id": ObjectId(item_id), "list_id": list_id})
        if not item_to_delete:
            raise HTTPException(status_code=404, detail="List item not found")

        item_position = item_to_delete.get("position", 0)

        # Delete the item
        delete_result = await db.list_items.delete_one({"_id": ObjectId(item_id), "list_id": list_id})
        if delete_result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="List item not found")

        # Update positions of all items that were after the deleted item
        await db.list_items.update_many(
            {"list_id": list_id, "position": {"$gt": item_position}},
            {"$inc": {"position": -1}}
        )

        return
    except Exception as e:
        if not isinstance(e, HTTPException):
            print(f"Error deleting list item: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete list item: {str(e)}"
            )
        raise e

# Rating endpoint - with permission check

@router.post("/lists/{list_id}/items/{item_id}/rate", response_model=ListItemModel)
async def rate_list_item(
    list_id: str,
    item_id: str,
    rating: int,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to rate list items")

    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    # Check if user has edit permission for this list
    has_permission = await check_list_permissions(db, list_id, str(current_user.id), PermissionLevel.EDIT)
    if not has_permission:
        raise HTTPException(status_code=403, detail="User does not have permission to rate items in this list")

    existing_item = await db.list_items.find_one({"_id": ObjectId(item_id), "list_id": list_id})
    if existing_item is None:
        raise HTTPException(status_code=404, detail="List item not found")

    await db.list_items.update_one({"_id": ObjectId(item_id)}, {"$set": {"rating": rating}})
    updated_item = await db.list_items.find_one({"_id": ObjectId(item_id)})
    return ListItemModel(**updated_item)

# User search endpoint (for sharing)

@router.get("/users/search", response_model=List[UserModel])
async def search_users(
    query: str,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="User is not approved to search users")

    # Only search for approved users
    cursor = db.users.find({
        "is_approved": True,
        "$or": [
            {"username": {"$regex": query, "$options": "i"}},
            {"email": {"$regex": query, "$options": "i"}}
        ]
    }).limit(10)  # Limit to 10 results for performance

    users = await cursor.to_list(length=None)

    # Don't include the current user in the results
    users = [user for user in users if str(user["_id"]) != str(current_user.id)]

    return [UserModel.from_mongo(user) for user in users]

@router.put("/lists/{list_id}/items/reorder", response_model=List[ListItemModel])
async def reorder_list_items(
    list_id: str,
    reorder_data: ReorderItemsRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    """
    Reorder items in a list based on new positions
    """
    if not current_user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not approved to modify list items"
        )

    # Check if user has permission to edit the list
    has_permission = await check_list_permissions(db, list_id, str(current_user.id), PermissionLevel.EDIT)
    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have permission to reorder items in this list"
        )

    try:
        # Validate the list exists
        list_data = await db.lists.find_one({"_id": ObjectId(list_id)})
        if not list_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="List not found"
            )

        # Process each item in the reorder request
        updated_items = []
        for item_data in reorder_data.items:
            try:
                item_id_obj = ObjectId(item_data.id)
            except:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid item ID format: {item_data.id}"
                )

            # Verify the item exists and belongs to this list
            item = await db.list_items.find_one({"_id": item_id_obj})
            if not item:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Item {item_data.id} not found"
                )
            if item.get("list_id") != list_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Item {item_data.id} does not belong to list {list_id}"
                )

            # Update the item's position
            await db.list_items.update_one(
                {"_id": item_id_obj},
                {"$set": {"position": item_data.position}}
            )

            # Get the updated item
            updated_item = await db.list_items.find_one({"_id": item_id_obj})
            updated_items.append(ListItemModel(**updated_item))

        # Return the updated items sorted by position
        return sorted(updated_items, key=lambda x: x.position)

    except Exception as e:
        print(f"Error reordering items: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reorder items: {str(e)}"
        )
