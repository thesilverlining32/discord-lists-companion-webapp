import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Star, Calendar, User, Tag } from 'lucide-react';
import { rateListItem } from '../../services/api';

const ItemDetailsDialog = ({
  item,
  isOpen,
  onClose,
  onItemUpdated
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentRating, setCurrentRating] = useState(item?.rating || 0);
  const [isRatingDirty, setIsRatingDirty] = useState(false);

  const handleRatingChange = (newRating) => {
    if (newRating === currentRating) {
      // Toggle off the rating if clicking the same star
      setCurrentRating(0);
    } else {
      setCurrentRating(newRating);
    }
    setIsRatingDirty(true);
  };

  const handleSaveRating = async () => {
    if (!isRatingDirty) return onClose();

    setIsSubmitting(true);
    setError(null);

    try {
      await rateListItem(item.list_id, item._id, currentRating);
      if (onItemUpdated) {
        onItemUpdated({
          ...item,
          rating: currentRating
        });
      }
      onClose();
    } catch (err) {
      console.error('Error updating rating:', err);
      setError('Failed to update rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex justify-between items-center">
            <span>{item.title}</span>
            <Badge variant="secondary">{item.type}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {/* Image (if available) */}
          {item.image_url && (
            <div className="w-full h-64 overflow-hidden rounded-md">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div className="text-gray-700">
              <h3 className="font-medium text-sm text-gray-500 mb-1">Description</h3>
              <p>{item.description}</p>
            </div>
          )}

          {/* Metadata */}
          {item.metadata && Object.keys(item.metadata).some(key => item.metadata[key]) && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-gray-500">Details</h3>
              <div className="grid grid-cols-1 gap-2">
                {item.metadata.creator && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">{item.metadata.creator}</span>
                  </div>
                )}
                {item.metadata.year && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">{item.metadata.year}</span>
                  </div>
                )}
                {item.metadata.genre && (
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">{item.metadata.genre}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rating Section */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-sm text-gray-500 mb-2">Your Rating</h3>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingChange(rating)}
                  className="text-2xl focus:outline-none mx-1 first:ml-0"
                  disabled={isSubmitting}
                >
                  <Star
                    className={`h-8 w-8 ${
                      currentRating >= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            onClick={handleSaveRating}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isRatingDirty ? 'Save Rating' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsDialog;
