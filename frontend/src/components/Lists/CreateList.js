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
      const listData = {
        name: listName.trim(),
        description: description.trim() || ""
      };

      console.log('Submitting list data:', listData);
      const response = await createList(listData);
      console.log('List created successfully:', response);
      navigate('/dashboard');
    } catch (err) {
      console.error('List creation error:', err);
      setError(err.message || 'Failed to create list. Please try again.');
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
            minLength={1}
            maxLength={100}
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
            maxLength={500}
          />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting || !listName.trim()}
        >
          {isSubmitting ? 'Creating...' : 'Create List'}
        </button>
      </form>
    </div>
  );
};

export default CreateList;
