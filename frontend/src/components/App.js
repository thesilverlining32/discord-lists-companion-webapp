import React, { useState, useEffect } from 'react';
import axios from 'axios';
import List from './List';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/status`)
      .then(response => {
        setUser(response.data.user);
      })
      .catch(error => {
        console.error('Error fetching user status:', error);
      });
  }, []);

  const handleLogout = () => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/logout`)
      .then(() => {
        setUser(null);
      })
      .catch(error => {
        console.error('Error logging out:', error);
      });
  };

  return (
    <div>
      <h1>My List App</h1>
      {user ? (
        <div>
          <p>Welcome, {user.username}#{user.discriminator}</p>
          <button onClick={handleLogout}>Logout</button>
          <List />
        </div>
      ) : (
        <div>
          <a href={`${process.env.REACT_APP_BACKEND_URL}/auth/discord`}>Login with Discord</a>
        </div>
      )}
    </div>
  );
};

export default App;
