import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Avatar, Box, Menu, MenuItem } from '@mui/material';
import octopusLogo from '../assets/octopus_logo.png';
import '../App.css'; // Import global CSS

const Header = ({ user }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getAvatarUrl = (user) => {
    if (user && user.avatar) {
      return `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`;
    }
    return null;
  };

  return (
    <AppBar position="relative" className="header">
      <Toolbar className="header-toolbar">
        <img src={octopusLogo} alt="Logo" className="header-logo" />
        <Typography variant="h6" className="header-title">
          My List App
        </Typography>
        {user && (
          <Box display="flex" alignItems="center">
            <Avatar
              src={getAvatarUrl(user)}
              alt={user.username}
              onClick={handleMenuOpen}
              className="header-avatar"
            />
            <Typography variant="body1" className="header-username">
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
