// src/components/Lists/ItemDetailsDialog.js
import React, { useState, useEffect } from 'react';
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
import {
  getMyItemReview,
  addOrUpdateItemReview,
  getItemReviews,
  getItemAverageRating
} from '../../services/api';

const ItemDetailsDialog = ({
  item,
  isOpen,
  onClose,
  onItemUpdated
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isRatingDirty, setIsRatingDirty] = useState(false);
  const [isCommentDirty, setIsCommentDirty] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    if (item && isOpen) {
      fetchReviewData();
    }
  }, [item, isOpen]);

  const fetchReviewData = async () => {
    try {
      // Get current user's review
      const myReviewResponse = await getMyItemReview(item.list_id, item._id);
      if (myReviewResponse.data) {
        setCurrentRating(myReviewResponse.data.rating || 0);
        setComment(myReviewResponse.data.comment || '');
      } else {
        setCurrentRating(0);
        setComment('');
      }

      // Get all reviews
      const reviewsResponse = await getItemReviews(item.list_id, item._id);
      setReviews(reviewsResponse.data || []);

      // Get average rating
      const avgRatingResponse = await getItemAverageRating(item.list_id, item._id);
      setAverageRating(avgRatingResponse.data.average_rating);
      setReviewCount(avgRatingResponse.data.count);

      // Reset dirty flags
      setIsRatingDirty(false);
      setIsCommentDirty(false);
    } catch (err) {
      console.error('Error fetching review data:', err);
      setError('Failed to load review data. Please try again.');
    }
  };

  const handleRatingChange = (newRating) => {
    if (newRating === currentRating) {
      // Toggle off the rating if clicking the same star
      setCurrentRating(0);
    } else {
      setCurrentRating(newRating);
    }
    setIsRatingDirty(true);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
    setIsCommentDirty(true);
  };

  const handleSaveReview = async () => {
    if (!isRatingDirty && !isCommentDirty) return onClose();

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare data object
      const reviewData = {};
      if (isRatingDirty) {
        reviewData.rating = currentRating || null;
      }
      if (isCommentDirty) {
        reviewData.comment = comment.trim() || null;
      }

      await addOrUpdateItemReview(item.list_id, item._id, reviewData);

      // Refresh the data to show updated reviews
      await fetchReviewData();

      // Notify parent component
      if (onItemUpdated) {
        onItemUpdated({
          ...item
        });
      }
    } catch (err) {
      console.error('Error updating review:', err);
      setError('Failed to update review. Please try again.');
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

          {/* Average Rating Section */}
          {reviewCount > 0 && (
            <div className="border p-3 rounded-md bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Overall Rating</h3>
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star
                          key={rating}
                          className={`h-5 w-5 ${
                            averageRating >= rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : averageRating >= rating - 0.5
                              ? 'text-yellow-400 fill-yellow-400 opacity-50'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {averageRating?.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Your Rating & Comment Section */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-sm text-gray-500 mb-2">Your Review</h3>

            {/* Rating */}
            <div className="mb-3">
              <label className="block text-sm mb-1">Rating</label>
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
            </div>

            {/* Comment */}
            <div className="mb-3">
              <label htmlFor="comment" className="block text-sm mb-1">Your Comment</label>
              <textarea
                id="comment"
                value={comment}
                onChange={handleCommentChange}
                placeholder="Write your thoughts about this item..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>

          {/* Other Reviews Section */}
          {reviews.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Other Reviews</h3>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b pb-3 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{review.user_name || 'User'}</span>
                      {review.rating && (
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Star
                              key={rating}
                              className={`h-4 w-4 ${
                                review.rating >= rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {review.comment && (
                      <p className="text-sm mt-1 text-gray-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            onClick={handleSaveReview}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (isRatingDirty || isCommentDirty) ? 'Save Review' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsDialog;
