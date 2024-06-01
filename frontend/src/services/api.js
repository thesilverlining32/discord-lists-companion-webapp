import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_BACKEND_URL });

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getLists = () => API.get('/api/lists');
export const createList = (data) => API.post('/api/lists', data);
export const updateList = (id, data) => API.put(`/api/lists/${id}`, data);
export const deleteList = (id) => API.delete(`/api/lists/${id}`);
export const getItems = (listId) => API.get(`/api/lists/${listId}/items`);
export const createItem = (listId, data) => API.post(`/api/lists/${listId}/items`, data);
export const updateItem = (listId, itemId, data) => API.put(`/api/lists/${listId}/items/${itemId}`, data);
export const deleteItem = (listId, itemId) => API.delete(`/api/lists/${listId}/items/${itemId}`);
