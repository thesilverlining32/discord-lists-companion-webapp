import React, { useState } from 'react';
import { Box, TextField, Button, Container } from '@mui/material';
import axios from 'axios';

const EditProfile = ({ user }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);

  const handleSave = () => {
    axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/users/${user._id}`, {
      username,
      email,
    })
    .then(response => {
      // Handle successful profile update
    })
    .catch(error => {
      console.error('There was an error updating the profile!', error);
    });
  };

  return (
    <Container className="edit-profile-container">
      <Box className="edit-profile-content" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <TextField
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
      </Box>
    </Container>
  );
};

export default EditProfile;
