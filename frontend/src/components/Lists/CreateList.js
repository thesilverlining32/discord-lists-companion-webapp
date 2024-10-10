import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createList } from '../../services/api';
import './CreateList.css';

const CreateList = () => {
  const [listName, setListName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createList({ name: listName, description });
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create list. Please try again.');
      console.error('Error creating list:', err);
    }
  };

  return (
    <div className="create-list">
      <h2>Create New List</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder="List Name"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
        />
        <button type="submit">Create List</button>
      </form>
    </div>
  );
};

export default CreateList;
