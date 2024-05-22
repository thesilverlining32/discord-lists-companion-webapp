import React, { useState } from 'react';
import { Box, TextField, Button, Container, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

const EditProfile = ({ user }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

  const handleSave = () => {
    axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/users/${user._id}`, {
      username,
      email,
    })
    .then(response => {
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    })
    .catch(error => {
      setSnackbar({ open: true, message: 'Error updating profile!', severity: 'error' });
      console.error('There was an error updating the profile!', error);
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
          disabled
        />
        <TextField
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          disabled
        />
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default EditProfile;
