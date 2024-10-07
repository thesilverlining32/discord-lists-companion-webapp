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

export const getLists = () => apiClient.get('/lists');
export const getList = (id) => apiClient.get(`/lists/${id}`);
export const createList = (data) => apiClient.post('/lists', data);
export const updateList = (id, data) => apiClient.put(`/lists/${id}`, data);
export const deleteList = (id) => apiClient.delete(`/lists/${id}`);

export const getListItems = (listId) => apiClient.get(`/lists/${listId}/items`);
export const createListItem = (listId, data) => apiClient.post(`/lists/${listId}/items`, data);
export const updateListItem = (listId, itemId, data) => apiClient.put(`/lists/${listId}/items/${itemId}`, data);
export const deleteListItem = (listId, itemId) => apiClient.delete(`/lists/${listId}/items/${itemId}`);
export const rateListItem = (listId, itemId, rating) => apiClient.post(`/lists/${listId}/items/${itemId}/rate`, { rating });
