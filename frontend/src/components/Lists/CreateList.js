// src/components/Lists/CreateList.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createList } from '../../services/api';
import './CreateList.css';

const CreateList = () => {
  const [listName, setListName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await createList({
        name: listName,
        description: description || null
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create list. Please try again.');
      console.error('Error creating list:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-list">
      <h2>Create New List</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="listName">List Name *</label>
          <input
            id="listName"
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="Enter list name"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            disabled={isSubmitting}
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create List'}
        </button>
      </form>
    </div>
  );
};

export default CreateList;
