import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Protected() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please login.');
          return;
        }

        const response = await axios.get('https://your-backend-url/auth/protected', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage(response.data.message);
      } catch (error) {
        setError('Error fetching protected data');
        console.error('Protected route error:', error);
      }
    };

    fetchProtectedData();
  }, []);

  return (
    <div>
      <h2>Protected Route</h2>
      {message && <p>{message}</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}

export default Protected;
