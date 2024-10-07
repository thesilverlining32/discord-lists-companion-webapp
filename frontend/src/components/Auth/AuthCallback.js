// src/components/Auth/Callback.js

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { getCurrentUser } from '../../services/auth';

const AuthCallback = () => {
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useUser();

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token');
    if (token) {
      localStorage.setItem('token', token);
      getCurrentUser()
        .then(userData => {
          setUser(userData);
          navigate('/dashboard');
        })
        .catch(err => {
          console.error('Error fetching user data:', err);
          setError('Authentication failed. Please try again.');
        });
    } else {
      setError('No token received. Please try logging in again.');
    }
  }, [location, navigate, setUser]);

  if (error) {
    return <div>{error}</div>;
  }

  return <div>Completing authentication...</div>;
};

export default AuthCallback;
