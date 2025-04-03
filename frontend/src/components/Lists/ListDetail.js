import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getList, getListItems, createListItem, updateListItem, deleteListItem } from '../../services/api';
import AddItemDialog from './AddItemDialog';
import ShareListDialog from './ShareListDialog';
import { useUser } from '../../contexts/UserContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
         AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
         AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Share, Eye, Trash, Edit, Plus } from 'lucide-react';
import './ListDetail.css';

const ListDetail = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [userPermission, setUserPermission] = useState(null);

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

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteListItem(listId, itemId);
      setItems(prevItems => prevItems.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete item');
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
          {canShareList() && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareDialogOpen(true)}
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

      {/* Items List Section */}
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
          <div className="grid gap-4 md:grid-cols-2">
            {items.map(item => (
              <Card key={item._id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {item.type}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      {canEditItems() && (
                        <Button
                          variant="ghost"
                          size="xs"
                          className="text-gray-500 hover:text-gray-700"
                          title="Edit Item"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDeleteItems() && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="xs"
                              className="text-red-500 hover:text-red-700"
                              title="Delete Item"
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
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteItem(item._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-gray-600 mb-2">{item.description}</p>
                  )}

                  {item.image_url && (
                    <div className="relative h-48 mb-2">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover rounded"
                      />
                    </div>
                  )}

                  {item.metadata && Object.keys(item.metadata).length > 0 && (
                    <div className="text-sm text-gray-500 mt-2 space-y-1">
                      {item.metadata.creator && (
                        <p>Creator: {item.metadata.creator}</p>
                      )}
                      {item.metadata.year && (
                        <p>Year: {item.metadata.year}</p>
                      )}
                      {item.metadata.genre && (
                        <p>Genre: {item.metadata.genre}</p>
                      )}
                    </div>
                  )}

                  {item.rating && (
                    <div className="mt-2 flex items-center">
                      <span className="text-sm text-gray-500 mr-1">Rating:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-lg ${star <= item.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
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
    </div>
  );
};

export default ListDetail;
