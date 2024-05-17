import React, { useState, useEffect } from 'react';
import axios from 'axios';
import List from './List';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';

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
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My List App
          </Typography>
          {user ? (
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          ) : (
            <Button color="inherit" href={`${process.env.REACT_APP_BACKEND_URL}/auth/discord`}>Login with Discord</Button>
          )}
        </Toolbar>
      </AppBar>
      <Container>
        {user ? (
          <List />
        ) : (
          <Typography variant="h6" sx={{ mt: 4 }}>
            Please log in to manage your lists.
          </Typography>
        )}
      </Container>
    </div>
  );
};

export default App;
