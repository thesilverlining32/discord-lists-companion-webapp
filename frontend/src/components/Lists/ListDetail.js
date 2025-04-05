import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getList, getListItems, createListItem, updateListItem, deleteListItem, updateItemsOrder } from '../../services/api';
import AddItemDialog from './AddItemDialog';
import EditItemDialog from './EditItemDialog';
import EditListDialog from './EditListDialog';
import ShareListDialog from './ShareListDialog';
import ItemDetailsDialog from './ItemDetailsDialog';
import { useUser } from '../../contexts/UserContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
         AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
         AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Share, Trash, Edit, Plus, PenSquare, Star, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './ListDetail.css';
import './ListItemStyles.css';

// Sortable item component
const SortableItem = ({
  item,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onClick
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: item._id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="list-item-container"
    >
      <div className="list-item-content" onClick={onClick}>
        <div className="flex items-center">
          {canEdit && (
            <div
              className="drag-handle mr-2 cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
          )}

          {item.image_url && (
            <div className="item-thumbnail">
              <img src={item.image_url} alt="" />
            </div>
          )}

          <div className="item-info">
            <h3 className="item-title">{item.title}</h3>
            <div className="item-meta">
              <Badge variant="secondary" className="text-xs">{item.type}</Badge>
              {item.metadata?.creator && (
                <span className="text-sm text-gray-500">{item.metadata.creator}</span>
              )}
              {item.metadata?.year && (
                <span className="text-sm text-gray-500">{item.metadata.year}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Rating display */}
          <div className={`rating-display ${item.rating ? 'has-rating' : 'no-rating'}`}>
            <Star className={`h-4 w-4 mr-1 ${item.rating ? 'text-yellow-400 fill-yellow-400' : ''}`} />
            <span className="text-sm">{item.rating || 'Rate'}</span>
          </div>

          {/* Item actions */}
          <div className="item-actions" onClick={e => e.stopPropagation()}>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Item</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{item.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cancel-button">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(item._id)}
                      className="confirm-delete-button"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ListDetail = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isEditListDialogOpen, setIsEditListDialogOpen] = useState(false);
  const [userPermission, setUserPermission] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isOrderChanged, setIsOrderChanged] = useState(false);

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Start dragging after moving 8px - prevents accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (user) {
      fetchListData();
    }
  }, [listId, user]);

  const fetchListData = async () => {
    try {
      setIsLoading(true);
      const [listResponse, itemsResponse] = await Promise.all([
        getList(listId),
        getListItems(listId)
      ]);

      const listData = listResponse.data;

      // Ensure consistent ID format
      if (listData && listData.owner_id) {
        listData.owner_id = String(listData.owner_id);
      }

      setList(listData);

      // Sort items by position/order if available, otherwise preserve API order
      const sortedItems = itemsResponse.data || [];
      // Add position attribute if not present
      const itemsWithPosition = sortedItems.map((item, index) => ({
        ...item,
        position: item.position ?? index
      }));

      // Sort by position
      itemsWithPosition.sort((a, b) => a.position - b.position);

      setItems(itemsWithPosition);
      determineUserPermission(listData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch list details. Please try again.');
      console.error('Error fetching list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const determineUserPermission = (listData) => {
    // Default to no permission
    let permission = null;

    // Check if user is the owner
    if (String(listData.owner_id) === String(user.id)) {
      setUserPermission('owner');
      return;
    }

    // Check if list is public
    if (listData.is_public) {
      permission = 'read';
    }

    // Check shared permissions
    const sharedWith = listData.shared_with || [];
    const userPermissions = sharedWith.find(p => String(p.user_id) === String(user.id));

    if (userPermissions) {
      permission = userPermissions.permission_level;
    }

    setUserPermission(permission);
  };

  const handleCreateItem = async (formData) => {
    try {
      // Set position to be at the end of the list
      const position = items.length > 0
        ? Math.max(...items.map(item => item.position || 0)) + 1
        : 0;

      const itemWithPosition = {
        ...formData,
        position
      };

      const response = await createListItem(listId, itemWithPosition);
      const newItem = { ...response.data, position };
      setItems(prevItems => [...prevItems, newItem]);
      return response.data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw new Error(error.response?.data?.detail || 'Failed to create item');
    }
  };

  const handleUpdateItem = async (formData) => {
    try {
      const itemId = formData._id;
      const response = await updateListItem(listId, itemId, formData);

      // Update the items state with the updated item
      setItems(prevItems =>
        prevItems.map(item => item._id === itemId ? {...response.data, position: item.position} : item)
      );

      return response.data;
    } catch (error) {
      console.error('Error updating item:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteListItem(listId, itemId);

      // Remove the item and update positions
      const updatedItems = items
        .filter(item => item._id !== itemId)
        .map((item, index) => ({
          ...item,
          position: index
        }));

      setItems(updatedItems);

      // Update positions in the backend
      await updateItemsOrder(
        listId,
        updatedItems.map((item, index) => ({
          id: item._id,
          position: index
        }))
      );
    } catch (error) {
      console.error('Error deleting item:', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete item');
    }
  };

  const handleItemUpdated = (updatedItem) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item._id === updatedItem._id
          ? {...updatedItem, position: item.position}
          : item
      )
    );
  };

  // Handle drag end event
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Find the indices of the dragged item and the target position
      const oldIndex = items.findIndex(item => item._id === active.id);
      const newIndex = items.findIndex(item => item._id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Create a new array with the updated order
        const newItems = [...items];
        const [movedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, movedItem);

        // Update positions on all items
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          position: index
        }));

        // Update the state immediately for better UX
        setItems(updatedItems);
        setIsOrderChanged(true);

        try {
          // Prepare data for the API - ensure we're sending strings for IDs
          const itemOrderData = updatedItems.map((item, index) => ({
            id: String(item._id),
            position: index
          }));

          console.log('Preparing to send order data:', itemOrderData);

          // Send the updated order to the backend
          await updateItemsOrder(listId, itemOrderData);
          setIsOrderChanged(false);
        } catch (error) {
          console.error('Error updating item order:', error);
          // If there's an error, revert to the original order
          fetchListData();
          setIsOrderChanged(false);
        }
      }
    }
  };

  const canCreateItems = () => {
    return userPermission === 'owner' ||
           userPermission === 'delete' ||
           userPermission === 'edit' ||
           userPermission === 'create';
  };

  const canEditItems = () => {
    return userPermission === 'owner' ||
           userPermission === 'delete' ||
           userPermission === 'edit';
  };

  const canDeleteItems = () => {
    return userPermission === 'owner' ||
           userPermission === 'delete';
  };

  const canShareList = () => {
    return userPermission === 'owner';
  };

  const canReorderItems = () => {
    return userPermission === 'owner' ||
           userPermission === 'delete' ||
           userPermission === 'edit';
  };

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!list) return <div className="p-6 text-center">List not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{list.name}</h1>
          {list.description && (
            <p className="text-gray-600">{list.description}</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            {list.is_public && (
              <Badge variant="secondary">Public</Badge>
            )}
            {userPermission === 'owner' ? (
              <Badge>Owner</Badge>
            ) : userPermission ? (
              <Badge variant="outline">{userPermission.charAt(0).toUpperCase() + userPermission.slice(1)} Access</Badge>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2">
          {userPermission === 'owner' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditListDialogOpen(true)}
              className="action-button"
            >
              <PenSquare className="h-4 w-4 mr-2" />
              Edit List
            </Button>
          )}
          {canShareList() && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareDialogOpen(true)}
              className="action-button"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </div>

      {/* Add Item Section */}
      {canCreateItems() && (
        <div className="mb-8">
          <AddItemDialog onSubmit={handleCreateItem} />
        </div>
      )}

      {/* Items List Section with Drag and Drop */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Items</h2>
          {isOrderChanged && (
            <Badge className="bg-blue-500">Order updated</Badge>
          )}
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <p className="empty-state-text">No items in this list yet.</p>
            {canCreateItems() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.querySelector('[data-dialog-trigger="add-item"]')?.click()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map(item => item._id)}
              strategy={verticalListSortingStrategy}
              disabled={!canReorderItems()}
            >
              <div className="space-y-0">
                {items.map((item) => (
                  <SortableItem
                    key={item._id}
                    item={item}
                    canEdit={canEditItems()}
                    canDelete={canDeleteItems()}
                    onEdit={(item) => {
                      setCurrentItem(item);
                      setIsEditItemDialogOpen(true);
                    }}
                    onDelete={handleDeleteItem}
                    onClick={() => {
                      setSelectedItem(item);
                      setIsDetailsDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {canReorderItems() && items.length > 1 && (
          <div className="mt-3 text-sm text-gray-500 flex items-center">
            <GripVertical className="h-4 w-4 mr-1" />
            <span>Drag items to reorder</span>
          </div>
        )}
      </div>

      {/* Share List Dialog */}
      <ShareListDialog
        list={list}
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        onListUpdated={fetchListData}
      />

      {/* Edit List Dialog */}
      <EditListDialog
        list={list}
        isOpen={isEditListDialogOpen}
        onClose={() => setIsEditListDialogOpen(false)}
        onListUpdated={fetchListData}
      />

      {/* Edit Item Dialog */}
      {currentItem && (
        <EditItemDialog
          item={currentItem}
          isOpen={isEditItemDialogOpen}
          onClose={() => {
            setIsEditItemDialogOpen(false);
            setCurrentItem(null);
          }}
          onSubmit={handleUpdateItem}
        />
      )}

      {/* Item Details Dialog */}
      {selectedItem && (
        <ItemDetailsDialog
          item={selectedItem}
          isOpen={isDetailsDialogOpen}
          onClose={() => {
            setIsDetailsDialogOpen(false);
            setSelectedItem(null);
          }}
          onItemUpdated={handleItemUpdated}
        />
      )}
    </div>
  );
};

export default ListDetail;
