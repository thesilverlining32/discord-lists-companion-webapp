// src/services/auth.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const loginWithDiscord = async () => {
  try {
    console.log('Attempting to login with Discord');
    console.log(`${API_URL}/auth/login`);
    const response = await axios.get(`${API_URL}/auth/login`);
    console.log('Login response:', response.data);
    if (response.data && response.data.url) {
      window.location.href = response.data.url;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Error initiating Discord login:', error);
    throw error;
  }
};

export const handleAuthCallback = async (code) => {
  try {
    const response = await axios.get(`${API_URL}/auth/callback`, { params: { code } });
    return response.data;
  } catch (error) {
    console.error('Error handling auth callback:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  // If you have a logout endpoint on your server, you can call it here
  // return axios.post(`${API_URL}/auth/logout`);
};
