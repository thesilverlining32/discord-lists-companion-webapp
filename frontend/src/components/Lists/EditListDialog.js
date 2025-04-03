import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { updateList } from '../../services/api';

const EditListDialog = ({ list, isOpen, onClose, onListUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set initial form data when the list or dialog open state changes
  useEffect(() => {
    if (list && isOpen) {
      setFormData({
        name: list.name || '',
        description: list.description || '',
        is_public: list.is_public || false
      });
    }
  }, [list, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate
      if (!formData.name.trim()) {
        throw new Error('List name is required');
      }

      // Create request body - only include fields we want to update
      const updateData = {
        ...list,
        name: formData.name.trim(),
        description: formData.description.trim(),
        is_public: formData.is_public
      };

      await updateList(list._id, updateData);
      if (onListUpdated) {
        onListUpdated();
      }
      onClose();
    } catch (err) {
      console.error('Error updating list:', err);
      setError(err.message || 'Failed to update list. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit List</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              List Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-3 py-2 border rounded"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center">
            <input
              id="is_public"
              name="is_public"
              type="checkbox"
              className="h-4 w-4 mr-2"
              checked={formData.is_public}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <label htmlFor="is_public" className="text-sm font-medium">
              Make this list public
            </label>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditListDialog;
