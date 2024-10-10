import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getList, createListItem, updateListItem, deleteListItem } from '../../services/api';
import './ListDetail.css';

const ListDetail = () => {
  const { listId } = useParams();
  const [list, setList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState({ title: '', description: '', type: 'Custom' });
  const [editingItem, setEditingItem] = useState(null);

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
      setError('Failed to fetch list details. Please try again.');
      console.error('Error fetching list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await createListItem(listId, newItem);
      setNewItem({ title: '', description: '', type: 'Custom' });
      fetchList();
    } catch (err) {
      setError('Failed to create list item. Please try again.');
      console.error('Error creating list item:', err);
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      await updateListItem(listId, editingItem.id, editingItem);
      setEditingItem(null);
      fetchList();
    } catch (err) {
      setError('Failed to update list item. Please try again.');
      console.error('Error updating list item:', err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteListItem(listId, itemId);
      fetchList();
    } catch (err) {
      setError('Failed to delete list item. Please try again.');
      console.error('Error deleting list item:', err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!list) return <div>List not found</div>;

  return (
    <div className="list-detail">
      <h2>{list.name}</h2>
      <p>{list.description}</p>

      <h3>Add New Item</h3>
      <form onSubmit={handleCreateItem}>
        <input
          type="text"
          value={newItem.title}
          onChange={(e) => setNewItem({...newItem, title: e.target.value})}
          placeholder="Title"
          required
        />
        <input
          type="text"
          value={newItem.description}
          onChange={(e) => setNewItem({...newItem, description: e.target.value})}
          placeholder="Description"
        />
        <select
          value={newItem.type}
          onChange={(e) => setNewItem({...newItem, type: e.target.value})}
        >
          <option value="Custom">Custom</option>
          <option value="Movie">Movie</option>
          <option value="Game">Game</option>
          <option value="Book">Book</option>
          <option value="Comic">Comic</option>
        </select>
        <button type="submit">Add Item</button>
      </form>

      <h3>Items:</h3>
      {list.items && list.items.length > 0 ? (
        <ul className="list-items">
          {list.items.map((item) => (
            <li key={item.id} className="list-item">
              {editingItem && editingItem.id === item.id ? (
                <form onSubmit={handleUpdateItem}>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  />
                  <select
                    value={editingItem.type}
                    onChange={(e) => setEditingItem({...editingItem, type: e.target.value})}
                  >
                    <option value="Custom">Custom</option>
                    <option value="Movie">Movie</option>
                    <option value="Game">Game</option>
                    <option value="Book">Book</option>
                    <option value="Comic">Comic</option>
                  </select>
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditingItem(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <p>Type: {item.type}</p>
                  {item.rating && <p>Rating: {item.rating}/5</p>}
                  <button onClick={() => setEditingItem(item)}>Edit</button>
                  <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No items in this list yet.</p>
      )}
    </div>
  );
};

export default ListDetail;
