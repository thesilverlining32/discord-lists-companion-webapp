import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AppBar, Toolbar, Typography, Button, Avatar, Box } from '@mui/material';

const Header = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/user`)
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the user info!', error);
      });
  }, []);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          My List App
        </Typography>
        {user && (
          <Box display="flex" alignItems="center">
            <Avatar src={user.avatar} alt={user.username} />
            <Typography variant="body1" style={{ marginLeft: '10px' }}>
              {user.username}
            </Typography>
            <Button color="inherit" href="/auth/logout" style={{ marginLeft: '20px' }}>Logout</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
