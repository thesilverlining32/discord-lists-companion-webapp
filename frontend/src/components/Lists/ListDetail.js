import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getList, getListItems, createListItem, updateListItem, deleteListItem, rateListItem } from '../../services/api';
import AddItemDialog from './AddItemDialog';
import EditItemDialog from './EditItemDialog';
import EditListDialog from './EditListDialog';
import ShareListDialog from './ShareListDialog';
import ItemDetailsDialog from './ItemDetailsDialog'; // Import the new component
import { useUser } from '../../contexts/UserContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
         AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
         AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Share, Eye, Trash, Edit, Plus, PenSquare, Star } from 'lucide-react';
import './ListDetail.css';

// Import the custom style for list items
import './ListItemStyles.css';

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

  // Item editing state
  const [currentItem, setCurrentItem] = useState(null);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);

  // Item details dialog state
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

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
      setItems(itemsResponse.data || []);

      // Debug info
      console.log('List data:', listData);
      console.log('Current user:', user);
      console.log('User ID type:', typeof user.id);
      console.log('List owner_id type:', typeof listData.owner_id);
      console.log('User ID:', user.id);
      console.log('List owner_id:', listData.owner_id);
      console.log('IDs match?', String(user.id) === String(listData.owner_id));

      // Determine user's permission level
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
    // Log for debugging
    console.log(`Checking permissions for list: ${listData.name}`);
    console.log(`List owner_id: ${listData.owner_id}, User id: ${user?.id}`);
    console.log(`String comparison: "${String(listData.owner_id)}" === "${String(user?.id)}"`);
    console.log(`Result: ${String(listData.owner_id) === String(user?.id)}`);

    // Default to no permission
    let permission = null;

    // Check if user is the owner - ensure string comparison
    if (String(listData.owner_id) === String(user.id)) {
      console.log("User is the owner!");
      setUserPermission('owner');
      return;
    }

    // Check if list is public
    if (listData.is_public) {
      permission = 'read';
    }

    // Check shared permissions - ensure string comparison
    const sharedWith = listData.shared_with || [];
    const userPermissions = sharedWith.find(p => String(p.user_id) === String(user.id));

    if (userPermissions) {
      permission = userPermissions.permission_level;
    }

    console.log(`Setting user permission to: ${permission}`);
    setUserPermission(permission);
  };

  const handleCreateItem = async (formData) => {
    try {
      const response = await createListItem(listId, formData);
      setItems(prevItems => [...prevItems, response.data]);
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
        prevItems.map(item => item._id === itemId ? response.data : item)
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
      setItems(prevItems => prevItems.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete item');
    }
  };

  // Handler for when an item is updated from the details dialog
  const handleItemUpdated = (updatedItem) => {
    setItems(prevItems =>
      prevItems.map(item => item._id === updatedItem._id ? updatedItem : item)
    );
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

  const canRateItems = () => {
    return userPermission === 'owner' ||
           userPermission === 'delete' ||
           userPermission === 'edit';
  };

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!list) return <div className="p-6 text-center">List not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Debug info - hidden in production */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-xs" style={{display: 'none'}}>
        <p>Debug: List owner_id: {list.owner_id}</p>
        <p>Debug: User id: {user.id}</p>
        <p>Debug: Permission: {userPermission}</p>
        <p>Debug: IDs equal? {String(list.owner_id) === String(user.id) ? 'Yes' : 'No'}</p>
      </div>

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

      {/* Items List Section - Now using a list layout instead of grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Items</h2>
        {items.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No items in this list yet.</p>
            {canCreateItems() && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => document.querySelector('[data-dialog-trigger="add-item"]')?.click()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div
                key={item._id}
                className="border rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedItem(item);
                  setIsDetailsDialogOpen(true);
                }}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {item.image_url && (
                      <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden">
                        <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <div className="flex items-center mt-1 space-x-2">
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
                    {item.rating ? (
                      <div className="flex items-center px-2 py-1 bg-gray-100 rounded-md">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-sm">{item.rating}</span>
                      </div>
                    ) : (
                      <div className="flex items-center px-2 py-1 bg-gray-100 rounded-md text-gray-400">
                        <Star className="h-4 w-4 mr-1" />
                        <span className="text-sm">Rate</span>
                      </div>
                    )}

                    {/* Item actions */}
                    <div className="flex space-x-1" onClick={e => e.stopPropagation()}>
                      {canEditItems() && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentItem(item);
                            setIsEditItemDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDeleteItems() && (
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
                                onClick={() => handleDeleteItem(item._id)}
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
            ))}
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
