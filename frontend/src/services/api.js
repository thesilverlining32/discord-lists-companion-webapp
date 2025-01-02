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

export const createList = async (data) => {
  // Only send the required fields in the exact format expected by the backend
  const formattedData = {
    name: data.name.trim(),
    description: data.description?.trim() || ""
  };

  try {
    console.log('Sending list creation request with data:', formattedData);
    const response = await apiClient.post('/lists', formattedData);
    console.log('List creation response:', response.data);
    return response.data;
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

export const createListItem = async (listId, data) => {
  // Format the data according to ListItemModel schema
  const formattedData = {
    list_id: listId,
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
    return response.data;
  } catch (error) {
    console.error('List item creation error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw new Error(error.response?.data?.detail || 'Failed to create item');
  }
};

export const getLists = () => apiClient.get('/lists');
export const getList = (id) => apiClient.get(`/lists/${id}`);
export const updateList = (id, data) => apiClient.put(`/lists/${id}`, data);
export const deleteList = (id) => apiClient.delete(`/lists/${id}`);

export const getListItems = (listId) => apiClient.get(`/lists/${listId}/items`);
export const updateListItem = (listId, itemId, data) => apiClient.put(`/lists/${listId}/items/${itemId}`, data);
export const deleteListItem = (listId, itemId) => apiClient.delete(`/lists/${listId}/items/${itemId}`);
export const rateListItem = (listId, itemId, rating) => apiClient.post(`/lists/${listId}/items/${itemId}/rate`, { rating });
