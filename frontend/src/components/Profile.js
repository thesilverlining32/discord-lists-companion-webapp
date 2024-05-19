import React from 'react';
import { Container, Typography, Avatar, Box, Button } from '@mui/material';

const Profile = ({ user }) => {
  return (
    <Container>
      <Box display="flex" flexDirection="column" alignItems="center" my={4}>
        <Avatar src={user.avatar} alt={user.username} sx={{ width: 100, height: 100 }} />
        <Typography variant="h4" gutterBottom>
          {user.username}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {user.email}
        </Typography>
        <Button variant="contained" color="primary" href="/edit-profile">
          Edit Profile
        </Button>
      </Box>
    </Container>
  );
};

export default Profile;
