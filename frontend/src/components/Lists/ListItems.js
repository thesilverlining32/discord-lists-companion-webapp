import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getList, getListItems, createListItem, updateListItem, deleteListItem, rateListItem } from '../../services/api';

const ListItems = () => {
  const { listId } = useParams();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ title: '', type: 'Custom', description: '' });

  useEffect(() => {
    fetchListAndItems();
  }, [listId]);

  const fetchListAndItems = async () => {
    try {
      const listResponse = await getList(listId);
      setList(listResponse.data);
      const itemsResponse = await getListItems(listId);
      setItems(itemsResponse.data);
    } catch (error) {
      console.error('Error fetching list and items:', error);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await createListItem(listId, newItem);
      setNewItem({ title: '', type: 'Custom', description: '' });
      fetchListAndItems();
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleUpdateItem = async (itemId, updatedData) => {
    try {
      await updateListItem(listId, itemId, updatedData);
      fetchListAndItems();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteListItem(listId, itemId);
      fetchListAndItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleRateItem = async (itemId, rating) => {
    try {
      await rateListItem(listId, itemId, rating);
      fetchListAndItems();
    } catch (error) {
      console.error('Error rating item:', error);
    }
  };

  if (!list) return <div>Loading...</div>;

  return (
    <div>
      <h2>{list.name}</h2>
      <p>{list.description}</p>
      <h3>Items</h3>
      <form onSubmit={handleCreateItem}>
        <input
          type="text"
          value={newItem.title}
          onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
          placeholder="Item title"
          required
        />
        <select
          value={newItem.type}
          onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
        >
          <option value="Custom">Custom</option>
          <option value="Movie">Movie</option>
          <option value="Game">Game</option>
          <option value="Book">Book</option>
          <option value="Comic">Comic</option>
        </select>
        <input
          type="text"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          placeholder="Description"
        />
        <button type="submit">Add Item</button>
      </form>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <h4>{item.title} ({item.type})</h4>
            <p>{item.description}</p>
            {item.rating && <p>Rating: {item.rating}/5</p>}
            <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
            <select
              value={item.rating || ''}
              onChange={(e) => handleRateItem(item.id, parseInt(e.target.value))}
            >
              <option value="">Rate</option>
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListItems;
