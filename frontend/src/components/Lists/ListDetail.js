import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getList, getListItems, createListItem, updateListItem, deleteListItem } from '../../services/api';
import CustomItemForm from './CustomItemForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';

const ListDetail = () => {
  const { listId } = useParams();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchListData();
  }, [listId]);

  const fetchListData = async () => {
    try {
      setIsLoading(true);
      const listResponse = await getList(listId);
      const itemsResponse = await getListItems(listId);
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

  const handleUpdateItem = async (formData) => {
    if (!editingItem) return;

    try {
      const response = await updateListItem(listId, editingItem._id, formData);
      setItems(prevItems =>
        prevItems.map(item =>
          item._id === editingItem._id ? response.data : item
        )
      );
      setEditingItem(null);
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
      setEditingItem(null);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{list.name}</h1>
        {list.description && (
          <p className="text-gray-600">{list.description}</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
        <CustomItemForm
          onSubmit={handleCreateItem}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Items</h2>
        {items.length === 0 ? (
          <p className="text-gray-600">No items in this list yet.</p>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <div
                key={item._id}
                className="bg-white p-4 rounded-lg shadow border border-gray-200"
              >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="text-red-600 hover:text-red-800">
                              Delete
                            </button>
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
                                onClick={async () => {
                                  try {
                                    await handleDeleteItem(item._id);
                                  } catch (error) {
                                    console.error('Failed to delete item:', error);
                                  }
                                }}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-gray-600 mb-2">{item.description}</p>
                    )}

                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full max-w-md h-48 object-cover rounded mb-2"
                      />
                    )}

                    {item.metadata && Object.keys(item.metadata).length > 0 && (
                      <div className="text-sm text-gray-500">
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
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListDetail;
