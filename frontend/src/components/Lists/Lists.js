import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLists, createList, deleteList } from '../../services/api';

const Lists = () => {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await getLists();
      setLists(response.data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    try {
      await createList({ name: newListName });
      setNewListName('');
      fetchLists();
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleDeleteList = async (id) => {
    try {
      await deleteList(id);
      fetchLists();
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  return (
    <div>
      <h2>My Lists</h2>
      <form onSubmit={handleCreateList}>
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New list name"
          required
        />
        <button type="submit">Create List</button>
      </form>
      <ul>
        {lists.map((list) => (
          <li key={list.id}>
            <Link to={`/lists/${list.id}`}>{list.name}</Link>
            <button onClick={() => handleDeleteList(list.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lists;
