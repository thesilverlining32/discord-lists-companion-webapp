// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Lists endpoints
export const createList = async (data) => {
  // Only send the required fields in the exact format expected by the backend
  const formattedData = {
    name: data.name.trim(),
    description: data.description?.trim() || "",
    is_public: data.is_public || false
  };

  try {
    console.log('Sending list creation request with data:', formattedData);
    const response = await apiClient.post('/lists', formattedData);
    console.log('List creation response:', response.data);
    return { data: response.data };
  } catch (error) {
    console.error('List creation error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      validationErrors: error.response?.data?.detail
    });

    // Extract error message
    let errorMessage = 'Failed to create list';
    if (error.response?.data?.detail) {
      errorMessage = Array.isArray(error.response.data.detail)
        ? error.response.data.detail[0].msg
        : error.response.data.detail;
    }

    throw new Error(errorMessage);
  }
};

export const getLists = () => apiClient.get('/lists');
export const getList = (id) => apiClient.get(`/lists/${id}`);
export const updateList = (id, data) => apiClient.put(`/lists/${id}`, data);
export const deleteList = (id) => apiClient.delete(`/lists/${id}`);

// List Items endpoints
export const createListItem = async (listId, data) => {
  // Format the data according to ListItemModel schema
  const formattedData = {
    list_id: String(listId),
    type: data.type || 'Custom',
    title: data.title.trim(),
    description: data.description?.trim() || null,
    metadata: data.metadata || null,
    image_url: data.image_url || null,
    rating: null
  };

  try {
    console.log('Sending list item creation request with data:', formattedData);
    const response = await apiClient.post(`/lists/${listId}/items`, formattedData);
    console.log('List item creation response:', response.data);
    return response;
  } catch (error) {
    console.error('List item creation error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw new Error(error.response?.data?.detail || 'Failed to create item');
  }
};

export const getListItems = (listId) => apiClient.get(`/lists/${listId}/items`);

export const updateListItem = (listId, itemId, data) => apiClient.put(`/lists/${listId}/items/${itemId}`, data);

export const deleteListItem = async (listId, itemId) => {
  try {
    console.log('Deleting item:', { listId, itemId });
    const response = await apiClient.delete(`/lists/${listId}/items/${itemId}`);
    console.log('Delete response:', response);
    return response;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

export const rateListItem = (listId, itemId, rating) => apiClient.post(`/lists/${listId}/items/${itemId}/rate`, { rating });

// Sharing endpoints
export const searchUsers = (query) => apiClient.get(`/users/search?query=${encodeURIComponent(query)}`);

export const shareList = async (listId, userId, permissionLevel) => {
  const data = {
    user_id: userId,
    permission_level: permissionLevel
  };
  return apiClient.post(`/lists/${listId}/share`, data);
};

export const getListShares = (listId) => apiClient.get(`/lists/${listId}/share`);

export const removeListShare = (listId, userId) => apiClient.delete(`/lists/${listId}/share/${userId}`);

export const setListPublic = (listId, isPublic) => apiClient.put(`/lists/${listId}/public?is_public=${isPublic}`);

/**
 * Updates the order of list items
 * @param {string} listId - The ID of the list
 * @param {Array} itemOrderData - Array of objects with item IDs and their new positions
 * @returns {Promise} - Promise resolving to the API response
 */
export const updateItemsOrder = async (listId, itemOrderData) => {
  try {
    // Log data for debugging
    console.log('Original itemOrderData:', itemOrderData);

    // Create the payload with the correctly named fields
    const payload = {
      items: itemOrderData.map(item => ({
        item_id: String(item.id),
        position: Number(item.position)
      }))
    };

    console.log('Formatted payload:', payload);
    console.log('Stringified payload:', JSON.stringify(payload));

    // Use the new endpoint
    const response = await apiClient.put(`/lists/${listId}/reorder`, payload);
    console.log('Success response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating item order:', error);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    throw error;
  }
};

export const testReorderModel = async () => {
  try {
    // Create a test payload with different formats to test
    const testPayload = {
      items: [
        // Test with string ID and number position (should work)
        { id: "64f32a1b5e2c0987654321", position: 0 },

        // Test with another string ID and number position
        { id: "64f32a1b5e2c0987654322", position: 1 },

        // Test with string ID and string position (might fail)
        { id: "64f32a1b5e2c0987654323", position: "2" }
      ]
    };

    console.log('Sending test payload:', testPayload);

    // Create the properly formatted payload
    const formattedPayload = {
      items: testPayload.items.map(item => ({
        id: String(item.id),
        position: Number(item.position)
      }))
    };

    console.log('Sending formatted test payload:', formattedPayload);

    const response = await apiClient.post('/lists/test-reorder', formattedPayload);
    console.log('Test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Test error:', error);
    if (error.response) {
      console.error('Test error response:', error.response.data);
    }
    throw error;
  }
};

// Add a simpler test with the exact expected format
export const testSimpleReorderModel = async () => {
  try {
    // Create a simple test payload
    const payload = {
      items: [
        { item_id: "123456789012345678901234", position: 0 },
        { item_id: "123456789012345678901235", position: 1 },
        { item_id: "123456789012345678901236", position: 2 }
      ]
    };

    console.log('Sending simple test payload:', payload);

    const response = await apiClient.post('/lists/test-reorder', payload);
    console.log('Simple test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Simple test error:', error);
    if (error.response) {
      console.error('Simple test error response:', error.response.data);
    }
    throw error;
  }
};

// Add this to your services/api.js file
export const testWithItemId = async () => {
  try {
    // Create a test payload with the item_id field instead of id
    const payload = {
      items: [
        { item_id: "123456789012345678901234", position: 0 },
        { item_id: "123456789012345678901235", position: 1 },
        { item_id: "123456789012345678901236", position: 2 }
      ]
    };

    console.log('Sending payload with item_id field:', payload);

    const response = await apiClient.post('/lists/test-reorder', payload);
    console.log('Test response with item_id:', response.data);
    return response.data;
  } catch (error) {
    console.error('Test error with item_id:', error);
    if (error.response) {
      console.error('Error response with item_id:', error.response.data);
    }
    throw error;
  }
};

export const updateItemsOrderDebug = async (listId, itemOrderData) => {
  try {
    console.log('Debug - Original itemOrderData:', itemOrderData);

    // Create the payload with the correctly named fields
    const payload = {
      items: itemOrderData.map(item => ({
        item_id: String(item.id),  // Keep the field name as item_id
        position: Number(item.position)
      }))
    };

    console.log('Debug - Final payload for debug endpoint:', payload);
    console.log('Debug - Stringified payload:', JSON.stringify(payload));

    // Call the debug endpoint
    const response = await apiClient.put(`/lists/${listId}/items/debug-reorder`, payload);
    console.log('Debug - Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Debug - Error:', error);
    throw error;
  }
};

// Also add a function to test the raw debug endpoint
export const testDebugRequest = async (payload) => {
  try {
    console.log('Sending test payload to debug endpoint:', payload);
    const response = await apiClient.put('/debug-request', payload);
    console.log('Debug response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Debug test error:', error);
    throw error;
  }
};

// New endpoints for item reviews
export const getItemReviews = (listId, itemId) =>
  apiClient.get(`/lists/${listId}/items/${itemId}/reviews`);

export const getMyItemReview = (listId, itemId) =>
  apiClient.get(`/lists/${listId}/items/${itemId}/reviews/me`);

export const addOrUpdateItemReview = (listId, itemId, data) =>
  apiClient.post(`/lists/${listId}/items/${itemId}/review`, data);

export const getItemAverageRating = (listId, itemId) =>
  apiClient.get(`/lists/${listId}/items/${itemId}/rating`);
