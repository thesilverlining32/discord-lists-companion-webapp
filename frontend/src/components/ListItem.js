import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ListItem = ({ listId }) => {
  const [items, setItems] = useState([]);
  const [itemContent, setItemContent] = useState('');

  useEffect(() => {
    // Fetch items for the given list
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/lists/${listId}/items`)
      .then(response => {
        setItems(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the items!', error);
      });
  }, [listId]);

  const handleAddItem = () => {
    // Add a new item to the list by making a POST request to the backend
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/lists/${listId}/items`, { content: itemContent })
      .then(response => {
        // Update the state to include the new item
        setItems([...items, response.data]);
        setItemContent('');
      })
      .catch(error => {
        console.error('There was an error adding the item!', error);
      });
  };

  return (
    <div>
      <input
        type="text"
        value={itemContent}
        onChange={e => setItemContent(e.target.value)}
        placeholder="New item"
      />
      <button onClick={handleAddItem}>Add Item</button>
      <ul>
        {items.map(item => (
          <li key={item._id}>{item.content}</li>
        ))}
      </ul>
    </div>
  );
};

export default ListItem;
