import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Avatar, Box, Menu, MenuItem } from '@mui/material';
import octopusLogo from '../assets/octopus_logo.png';

const Header = ({ user }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="relative" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <img src={octopusLogo} alt="Logo" style={{ height: '50px', marginRight: '20px' }} />
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          My List App
        </Typography>
        {user && (
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
              <MenuItem onClick={() => { window.location.href = '/auth/logout'; }}>Logout</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
