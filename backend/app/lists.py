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
        # Important: Use the string representation of the _id field (not discord_id)
        # This is the key change - ensure we're using the same ID format for ownership checks
        new_list = {
            "name": list_data.name,
            "description": list_data.description,
            "owner_id": str(current_user.id),  # Using the ID from UserModel
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
