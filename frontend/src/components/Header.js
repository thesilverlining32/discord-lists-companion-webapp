import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AppBar, Toolbar, Typography, Button, Avatar, Box, Menu, MenuItem } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Header = ({ user, onLogout }) => {
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
            <Avatar src={user.avatar} alt={user.username} onClick={handleMenuOpen}>
              {user.username.charAt(0)}
            </Avatar>
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
              <MenuItem onClick={onLogout}>Logout</MenuItem>
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
