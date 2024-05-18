import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AppBar, Toolbar, Typography, Avatar, Box, Menu, MenuItem, Button } from '@mui/material';

const Header = ({ user, handleLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          My List App
        </Typography>
        {user ? (
          <Box display="flex" alignItems="center">
            <Avatar src={user.avatar} alt={user.username} onClick={handleMenuOpen} />
            <Typography variant="body1" style={{ marginLeft: '10px' }}>
              {user.username}
            </Typography>
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button color="inherit" href={`${process.env.REACT_APP_BACKEND_URL}/auth/discord`}>
            Login with Discord
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
