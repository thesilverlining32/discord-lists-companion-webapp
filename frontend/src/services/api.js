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

// Modified createList function to properly format the request
export const createList = async (data) => {
  const formattedData = {
    name: data.name,
    description: data.description || null,
    owner_id: null  // This will be set by the backend
  };
  
  try {
    const response = await apiClient.post('/lists', formattedData);
    return response.data;
  } catch (error) {
    console.error('Error creating list:', error.response?.data || error.message);
    throw error;
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
