import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLists, createList } from '../../services/api';
import './Lists.css';

const Lists = () => {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setIsLoading(true);
      const response = await getLists();
      setLists(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch lists. Please try again.');
      console.error('Error fetching lists:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    try {
      const newList = await createList({ name: newListName, description: newListDescription });
      setLists([...lists, newList.data]);
      setNewListName('');
      setNewListDescription('');
      setError(null);
    } catch (err) {
      setError('Failed to create list. Please try again.');
      console.error('Error creating list:', err);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="lists-container">
      <h2>My Lists</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleCreateList} className="create-list-form">
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New list name"
          required
        />
        <input
          type="text"
          value={newListDescription}
          onChange={(e) => setNewListDescription(e.target.value)}
          placeholder="List description (optional)"
        />
        <button type="submit">Create List</button>
      </form>
      <ul className="lists">
        {lists.map((list) => (
          <li key={list.id} className="list-item">
            <Link to={`/lists/${list.id}`}>{list.name}</Link>
            <p>{list.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lists;
