import React, { useState } from 'react';
import { Box, TextField, Button, Container } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const EditProfile = ({ user }) => {
  const [bio, setBio] = useState(user.bio || '');
  const [location, setLocation] = useState(user.location || '');
  const navigate = useNavigate();

  const handleSave = () => {
    axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/users/${user._id}`, {
      bio,
      location,
    })
    .then(response => {
      console.log('Profile updated successfully', response.data);
      navigate('/profile');
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
          value={user.username}
          InputProps={{
            readOnly: true,
          }}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          variant="outlined"
          value={user.email}
          InputProps={{
            readOnly: true,
          }}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Bio"
          variant="outlined"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Location"
          variant="outlined"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
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
