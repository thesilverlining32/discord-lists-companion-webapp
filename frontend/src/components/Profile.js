import React from 'react';
import { Box, Typography, Avatar, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = ({ user }) => {
  const navigate = useNavigate();

  return (
    <Container className="profile-container">
      <Box className="profile-content" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Avatar
          src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`}
          alt={user.username}
          className="profile-avatar"
        />
        <Typography variant="h4" gutterBottom>
          {user.username}
        </Typography>
        <Typography variant="h6" gutterBottom>
          {user.email}
        </Typography>
        {user.bio && (
          <Typography variant="body1" gutterBottom>
            Bio: {user.bio}
          </Typography>
        )}
        {user.location && (
          <Typography variant="body1" gutterBottom>
            Location: {user.location}
          </Typography>
        )}
        <Button variant="contained" color="primary" onClick={() => navigate('/edit-profile')}>
          Edit Profile
        </Button>
      </Box>
    </Container>
  );
};

export default Profile;
