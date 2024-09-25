// src/components/Auth/Callback.js

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { handleAuthCallback } from '../../services/auth';

const AuthCallback = () => {
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URLSearchParams(location.search).get('code');
    if (code) {
      handleAuthCallback(code)
        .then(data => {
          localStorage.setItem('token', data.access_token);
          navigate('/dashboard');
        })
        .catch(err => {
          console.error('Error in auth callback:', err);
          setError('Authentication failed. Please try again.');
        });
    }
  }, [location, navigate]);

  if (error) {
    return <div>{error}</div>;
  }

  return <div>Authenticating...</div>;
};

export default AuthCallback;
