import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Avatar, Box, Menu, MenuItem } from '@mui/material';
import octopusLogo from '../assets/octopus_logo.png';
import '../App.css'; // Import the global CSS file

const Header = ({ user }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="relative" className="app-bar">
      <Toolbar className="header-toolbar">
        <img src={octopusLogo} alt="Logo" className="header-logo" />
        <Typography variant="h6" className="header-title">
          My List App
        </Typography>
        {user && (
          <Box className="user-info">
            <Avatar src={user.avatar} alt={user.username} onClick={handleMenuOpen} className="user-avatar" />
            <Typography variant="body1" className="user-name">
              {user.username}
            </Typography>
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
              <MenuItem onClick={() => { window.location.href = '/auth/logout'; }}>Logout</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
