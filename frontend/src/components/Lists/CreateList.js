import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createList } from '../../services/api';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import './CreateList.css';

const CreateList = () => {
  const [listName, setListName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
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
        description: description.trim() || "",
        is_public: isPublic
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
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
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
        <div className="form-group">
          <div className="flex items-center">
            <input
              id="isPublic"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 mr-2"
              disabled={isSubmitting}
            />
            <label htmlFor="isPublic" className="text-sm font-medium">
              Make this list public (anyone with the link can view)
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Public lists can be viewed by anyone, even users who haven't been explicitly shared with.
          </p>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || !listName.trim()}
          className="w-full"
        >
          {isSubmitting ? 'Creating...' : 'Create List'}
        </Button>
      </form>
    </div>
  );
};

export default CreateList;
