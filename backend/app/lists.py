from fastapi import APIRouter, Depends, HTTPException, status, Request, Body
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import List, Optional
from app.auth import get_current_user
from app.models import (
    UserModel,
    ListModel,
    ListItemModel,
    ListCreateRequest,
    UserPermission,
    ShareListRequest,
    PermissionLevel,
    ReorderItemsRequest,
    ItemOrderData
)
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

@router.put("/lists/{list_id}/items/reorder", status_code=status.HTTP_200_OK)
async def reorder_list_items(
    list_id: str,
    request: Request,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    """Reorder items in a list based on new positions"""
    print("\n" + "=" * 50)
    print(f"REORDER REQUEST START - list_id: {list_id}")
    print("=" * 50)

    try:
        # Check if user has edit permission for this list
        has_permission = await check_list_permissions(db, list_id, str(current_user.id), PermissionLevel.EDIT)
        if not has_permission:
            raise HTTPException(status_code=403, detail="User does not have permission to reorder items in this list")

        # Get raw request data
        raw_body = await request.body()
        print(f"Raw request body: {raw_body}")

        # Parse JSON manually to avoid model validation issues
        import json
        body_json = json.loads(raw_body.decode('utf-8'))
        print(f"Parsed JSON: {json.dumps(body_json, indent=2)}")

        if 'items' not in body_json or not isinstance(body_json['items'], list):
            raise HTTPException(status_code=422, detail="Request must include 'items' array")

        items = body_json['items']
        print(f"Found {len(items)} items to reorder")

        # Process each item with flexible field names
        update_operations = []
        for i, item in enumerate(items):
            print(f"Processing item {i}: {item}")

            # Try different field names for item ID
            item_id = None
            if 'item_id' in item:
                item_id = item['item_id']
            elif 'id' in item:
                item_id = item['id']

            if not item_id:
                raise HTTPException(
                    status_code=422,
                    detail=f"Item at index {i} is missing ID field (expected 'id' or 'item_id')"
                )

            if 'position' not in item:
                raise HTTPException(
                    status_code=422,
                    detail=f"Item at index {i} is missing required 'position' field"
                )

            # Convert position to integer if needed
            position = item['position']
            if not isinstance(position, (int, float)):
                try:
                    position = int(position)
                except (ValueError, TypeError):
                    raise HTTPException(
                        status_code=422,
                        detail=f"Position value for item at index {i} must be a number"
                    )

            # Verify item exists in this list
            try:
                item_exists = await db.list_items.find_one({
                    "_id": ObjectId(item_id),
                    "list_id": list_id
                })

                if not item_exists:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Item with ID {item_id} not found in list {list_id}"
                    )

                update_operations.append({
                    "item_id": item_id,
                    "position": position
                })

            except Exception as e:
                print(f"Error processing item {item_id}: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Error processing item {item_id}: {str(e)}"
                )

        # Perform the updates
        for op in update_operations:
            result = await db.list_items.update_one(
                {"_id": ObjectId(op["item_id"])},
                {"$set": {"position": op["position"]}}
            )
            print(f"Update result for {op['item_id']}: matched={result.matched_count}, modified={result.modified_count}")

        print(f"Successfully reordered {len(update_operations)} items")
        return {"message": "Items reordered successfully", "items_updated": len(update_operations)}

    except HTTPException as http_err:
        print(f"HTTP error in reorder_list_items: {http_err.detail}")
        raise http_err
    except Exception as e:
        print(f"Error in reorder_list_items: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {str(e)}"
        )

    print("=" * 50)
    print("REORDER REQUEST END")
    print("=" * 50)

@router.post("/lists/test-reorder", status_code=status.HTTP_200_OK)
async def test_reorder_model(request: Request):
    """Test endpoint to validate the ReorderItemsRequest model"""
    try:
        # Log raw request
        raw_body = await request.body()
        print(f"TEST ENDPOINT - Raw body: {raw_body}")

        # Parse as JSON
        body_str = raw_body.decode('utf-8')
        import json
        body_json = json.loads(body_str)
        print(f"TEST ENDPOINT - Parsed JSON: {body_json}")

        # Try to validate with our model
        from app.models import ReorderItemsRequest, ItemOrderData

        # Try validating ItemOrderData first
        if 'items' in body_json and len(body_json['items']) > 0:
            first_item = body_json['items'][0]
            print(f"TEST ENDPOINT - First item: {first_item}")

            # Try both field names
            if 'item_id' in first_item and 'id' not in first_item:
                print("Converting item_id to id for validation...")
                validation_item = {**first_item, 'id': first_item['item_id']}
                del validation_item['item_id']
            else:
                validation_item = first_item

            item_model = ItemOrderData(**validation_item)
            print(f"TEST ENDPOINT - Item model validated: {item_model}")

        # Then validate the whole request
        # Convert all items for validation
        if 'items' in body_json:
            validation_items = []
            for item in body_json['items']:
                if 'item_id' in item and 'id' not in item:
                    validation_item = {**item, 'id': item['item_id']}
                    del validation_item['item_id']
                    validation_items.append(validation_item)
                else:
                    validation_items.append(item)

            validation_data = {'items': validation_items}
        else:
            validation_data = body_json

        model = ReorderItemsRequest(**validation_data)
        print(f"TEST ENDPOINT - Full model validated: {model}")

        # Return success with the validated model
        return {"success": True, "model": model.model_dump()}

    except Exception as e:
        print(f"TEST ENDPOINT - Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}

# Add this to your lists.py file at the bottom

@router.put("/debug-request")
async def debug_request(request: Request):
    """Debug endpoint that logs all request details"""
    print("\n" + "=" * 80)
    print("DEBUG REQUEST ENDPOINT")
    print("=" * 80)

    # Print request details
    print(f"Method: {request.method}")
    print(f"URL: {request.url}")

    # Print headers
    print("\nHEADERS:")
    for name, value in request.headers.items():
        print(f"  {name}: {value}")

    # Print body
    try:
        body = await request.body()
        print("\nRAW BODY:")
        print(body)

        if body:
            try:
                body_str = body.decode('utf-8')
                print("\nBODY AS STRING:")
                print(body_str)

                try:
                    import json
                    body_json = json.loads(body_str)
                    print("\nBODY AS JSON:")
                    print(json.dumps(body_json, indent=2))

                    # If it has an 'items' key, examine its structure
                    if 'items' in body_json and isinstance(body_json['items'], list):
                        print("\nEXAMINING ITEMS:")
                        for i, item in enumerate(body_json['items']):
                            print(f"Item {i}:")
                            print(f"  Type: {type(item)}")
                            print(f"  Contents: {item}")
                            print(f"  Keys: {list(item.keys())}")
                            for key, value in item.items():
                                print(f"    {key}: {value} (type: {type(value)})")
                except json.JSONDecodeError as e:
                    print(f"\nNot valid JSON: {e}")
            except UnicodeDecodeError as e:
                print(f"\nNot valid UTF-8: {e}")
    except Exception as e:
        print(f"\nError reading body: {e}")

    print("=" * 80)
    return {"message": "Request details logged to console"}

@router.put("/lists/{list_id}/items/debug-reorder")
async def debug_reorder_items(list_id: str, request: Request):
    """Debug version of the reorder items endpoint that just logs information"""
    print("\n" + "=" * 80)
    print(f"DEBUG REORDER ITEMS - list_id: {list_id}")
    print("=" * 80)

    # Print raw request
    try:
        body = await request.body()
        print(f"Raw request body: {body}")

        if body:
            try:
                body_str = body.decode('utf-8')
                print(f"Body as string: {body_str}")

                try:
                    import json
                    body_json = json.loads(body_str)
                    print(f"Body as JSON: {json.dumps(body_json, indent=2)}")

                    # Try to parse as a model
                    from app.models import ReorderItemsRequest, ItemOrderData
                    print("\nTRYING MODEL VALIDATION:")

                    # First try to validate an individual item
                    if 'items' in body_json and body_json['items']:
                        first_item = body_json['items'][0]
                        print(f"First item: {first_item}")

                        # Try direct validation first
                        try:
                            print("Validating with direct fields...")
                            item = ItemOrderData(**first_item)
                            print(f"Successful validation: {item}")
                        except Exception as e:
                            print(f"Direct validation failed: {e}")

                            # Try with field alias mapping
                            try:
                                print("Trying field alias mapping...")
                                if 'item_id' in first_item and 'id' not in first_item:
                                    test_item = {'id': first_item['item_id'], 'position': first_item['position']}
                                    print(f"Transformed item: {test_item}")
                                    item = ItemOrderData(**test_item)
                                    print(f"Validation with mapping succeeded: {item}")
                            except Exception as e:
                                print(f"Alias mapping validation failed: {e}")

                    # Now try full model validation
                    try:
                        print("\nValidating full request model...")
                        model = ReorderItemsRequest(**body_json)
                        print(f"Full model validation succeeded: {model}")
                    except Exception as e:
                        print(f"Full model validation failed: {e}")
                        import traceback
                        traceback.print_exc()

                        # Try field mapping for the whole payload
                        try:
                            print("\nTrying with field mapping for all items...")
                            mapped_items = []
                            for item in body_json.get('items', []):
                                if 'item_id' in item and 'id' not in item:
                                    mapped_items.append({
                                        'id': item['item_id'],
                                        'position': item['position']
                                    })
                                else:
                                    mapped_items.append(item)

                            mapped_payload = {'items': mapped_items}
                            print(f"Mapped payload: {json.dumps(mapped_payload, indent=2)}")
                            model = ReorderItemsRequest(**mapped_payload)
                            print(f"Validation with mapping succeeded: {model}")
                        except Exception as e:
                            print(f"Field mapping validation still failed: {e}")
                            traceback.print_exc()
                except json.JSONDecodeError as e:
                    print(f"Not valid JSON: {e}")
            except UnicodeDecodeError as e:
                print(f"Not valid UTF-8: {e}")
    except Exception as e:
        print(f"Error reading request: {e}")

    print("=" * 80)

    # Return detailed information
    return {
        "message": "Debug information logged to console",
        "list_id": list_id,
        "success": False,
        "reason": "This is a debug endpoint that only logs information"
    }

# Define a simple schema class directly in the endpoint file
class ItemOrder(BaseModel):
    item_id: str
    position: int

class ReorderRequest(BaseModel):
    items: List[ItemOrder]

@router.put("/lists/{list_id}/reorder", status_code=status.HTTP_200_OK)
async def reorder_items(
    list_id: str,
    data: ReorderRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncIOMotorClient = Depends(get_database)
):
    """Reorder items in a list"""
    print(f"\nReordering items for list: {list_id}")
    print(f"Received data: {data}")

    # Check user permissions
    has_permission = await check_list_permissions(db, list_id, str(current_user.id), PermissionLevel.EDIT)
    if not has_permission:
        raise HTTPException(status_code=403, detail="User does not have permission to reorder items in this list")

    # Process each item
    for item in data.items:
        # Update position in database
        print(f"Updating item {item.item_id} to position {item.position}")
        try:
            result = await db.list_items.update_one(
                {"_id": ObjectId(item.item_id), "list_id": list_id},
                {"$set": {"position": item.position}}
            )
            print(f"Update result: matched={result.matched_count}, modified={result.modified_count}")

            if result.matched_count == 0:
                print(f"Item {item.item_id} not found in list {list_id}")
                raise HTTPException(status_code=404, detail=f"Item {item.item_id} not found in list {list_id}")

        except Exception as e:
            print(f"Error updating item {item.item_id}: {str(e)}")
            if not isinstance(e, HTTPException):
                raise HTTPException(status_code=500, detail=f"Error updating item {item.item_id}")
            raise e

    return {"message": "Items reordered successfully", "items_updated": len(data.items)}
