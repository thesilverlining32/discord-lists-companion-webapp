import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';

function Callback() {
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const fetchToken = async () => {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          const response = await axios.get(`https://your-backend-url/auth/callback?code=${code}`);
          localStorage.setItem('token', response.data.access_token);
          history.push('/protected');
        } catch (error) {
          console.error('Error fetching token:', error);
          history.push('/login');
        }
      } else {
        history.push('/login');
      }
    };

    fetchToken();
  }, [history, location]);

  return <div>Processing login...</div>;
}

export default Callback;
