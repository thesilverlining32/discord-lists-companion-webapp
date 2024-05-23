import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Avatar, Box, Menu, MenuItem } from '@mui/material';
import octopusLogo from '../assets/octopus_logo.png';
import { Link } from 'react-router-dom';

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
      <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <img src={octopusLogo} alt="Logo" className="header-logo" />
          <Typography variant="h6" style={{ margin: 'auto 0' }}>
            My List App
          </Typography>
        </Link>
        {user && (
          <Box display="flex" alignItems="center">
            <Avatar src={user.avatar} alt={user.username} onClick={handleMenuOpen} sx={{ cursor: 'pointer' }} />
            <Typography variant="body1" sx={{ marginLeft: '10px' }}>
              {user.username}
            </Typography>
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose} component={Link} to="/profile">Profile</MenuItem>
              <MenuItem onClick={() => { window.location.href = '/auth/logout'; }}>Logout</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
