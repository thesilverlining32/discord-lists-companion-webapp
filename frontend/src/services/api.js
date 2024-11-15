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
  // Remove any undefined or null values
  const formattedData = {
    name: data.name,
    description: data.description || "",  // Empty string instead of null
    // Don't include owner_id as it will be set by the backend
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
      message: error.message
    });
    
    // Format error message for display
    const errorMessage = error.response?.data?.detail 
      ? Array.isArray(error.response.data.detail)
        ? error.response.data.detail[0].msg
        : error.response.data.detail
      : 'Failed to create list';
    
    throw new Error(errorMessage);
  }
};

export const getLists = () => apiClient.get('/lists');
export const getList = (id) => apiClient.get(`/lists/${id}`);
export const updateList = (id, data) => apiClient.put(`/lists/${id}`, data);
export const deleteList = (id) => apiClient.delete(`/lists/${id}`);

export const getListItems = (listId) => apiClient.get(`/lists/${listId}/items`);
export const createListItem = (listId, data) => apiClient.post(`/lists/${listId}/items`, data);
export const updateListItem = (listId, itemId, data) => apiClient.put(`/lists/${listId}/items/${itemId}`, data);
export const deleteListItem = (listId, itemId) => apiClient.delete(`/lists/${listId}/items/${itemId}`);
export const rateListItem = (listId, itemId, rating) => apiClient.post(`/lists/${listId}/items/${itemId}/rate`, { rating });
