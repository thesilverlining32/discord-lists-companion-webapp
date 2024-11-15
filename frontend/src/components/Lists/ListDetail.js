import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
         AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
         AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getList, createListItem, updateListItem, deleteListItem, deleteList } from '../../services/api';

const ListDetail = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    type: 'Custom',
    metadata: {},
    image_url: ''
  });

  useEffect(() => {
    fetchList();
  }, [listId]);

  const fetchList = async () => {
    try {
      setIsLoading(true);
      const response = await getList(listId);
      setList(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch list details');
      console.error('Error fetching list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const itemData = {
        ...newItem,
        list_id: listId
      };
      await createListItem(listId, itemData);
      setNewItem({ title: '', description: '', type: 'Custom', metadata: {}, image_url: '' });
      fetchList();
    } catch (err) {
      setError('Failed to create list item');
      console.error('Error creating list item:', err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteListItem(listId, itemId);
      fetchList();
    } catch (err) {
      setError('Failed to delete list item');
      console.error('Error deleting list item:', err);
    }
  };

  const handleDeleteList = async () => {
    try {
      await deleteList(listId);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to delete list');
      console.error('Error deleting list:', err);
    }
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!list) return <div className="p-4">List not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{list.name}</h2>

        <AlertDialog>
          <AlertDialogTrigger className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Delete List
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the list and all its items.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteList} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <p className="text-gray-600 mb-8">{list.description}</p>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Add New Item</h3>
        <form onSubmit={handleCreateItem}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={newItem.type}
                onChange={(e) => setNewItem({...newItem, type: e.target.value})}
              >
                <option value="Custom">Custom</option>
                <option value="Movie">Movie</option>
                <option value="Game">Game</option>
                <option value="Book">Book</option>
                <option value="Comic">Comic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={newItem.title}
                onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Items</h3>
        {list.items?.length > 0 ? (
          list.items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-medium">{item.title}</h4>
                  <p className="text-gray-600">{item.description}</p>
                  <span className="inline-block bg-gray-100 rounded px-2 py-1 text-sm text-gray-700 mt-2">
                    {item.type}
                  </span>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger className="text-red-600 hover:text-red-700">
                    Delete
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this item?
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteItem(item.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No items in this list yet.</p>
        )}
      </div>
    </div>
  );
};

export default ListDetail;
