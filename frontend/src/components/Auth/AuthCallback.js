// src/components/Auth/Callback.js

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { handleAuthCallback } from '../../services/auth';
import { useUser } from '../../contexts/UserContext';

const AuthCallback = () => {
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useUser();

  useEffect(() => {
    const code = new URLSearchParams(location.search).get('code');
    if (code) {
      handleAuthCallback(code)
        .then(data => {
          localStorage.setItem('token', data.access_token);
          // Fetch user data here and update the user context
          // For now, we'll just set a simple user object
          setUser({ isLoggedIn: true });
          navigate('/dashboard');
        })
        .catch(err => {
          console.error('Error in auth callback:', err);
          setError('Authentication failed. Please try again.');
        });
    }
  }, [location, navigate, setUser]);

  if (error) {
    return <div>{error}</div>;
  }

  return <div>Authenticating...</div>;
};

export default AuthCallback;
