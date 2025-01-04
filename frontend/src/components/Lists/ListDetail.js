import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getList, getListItems, createListItem, updateListItem, deleteListItem } from '../../services/api';
import AddItemDialog from './AddItemDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
         AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
         AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ListDetail = () => {
  const { listId } = useParams();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchListData();
  }, [listId]);

  const fetchListData = async () => {
    try {
      setIsLoading(true);
      const [listResponse, itemsResponse] = await Promise.all([
        getList(listId),
        getListItems(listId)
      ]);
      setList(listResponse.data);
      setItems(itemsResponse.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch list details. Please try again.');
      console.error('Error fetching list:', err);
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!list) return <div className="p-4">List not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{list.name}</h1>
        {list.description && (
          <p className="text-gray-600">{list.description}</p>
        )}
      </div>

      {/* Add Item Section */}
      <div className="mb-8">
        <AddItemDialog onSubmit={handleCreateItem} />
      </div>

      {/* Items List Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Items</h2>
        {items.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No items in this list yet.</p>
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
                    <AlertDialog>
                      <AlertDialogTrigger className="text-red-600 hover:text-red-800">
                        Delete
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListDetail;
