import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'; // Import useNavigate
import List from './List';
import Layout from './Layout';
import Header from './Header'; // Import the header
import Profile from './Profile'; // Import the Profile component
import EditProfile from './EditProfile';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Typography, Container, Box, Button } from '@mui/material';
import octopusLogo from '../assets/octopus_logo.png'; // Correct import path
import './App.css'; // Ensure this is the correct path to your CSS file

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7289da',
    },
    background: {
      default: '#2c2f33',
      paper: '#23272a',
    },
    text: {
      primary: '#ffffff',
    },
  },
});

const App = () => {
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const navigate = useNavigate(); // Use useNavigate to define navigate

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/status`)
      .then(response => {
        console.log(response.data.user); // Check the user object
        setUser(response.data.user);
        if (response.data.user) {
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/lists`)
            .then(res => {
              setLists(res.data);
            })
            .catch(err => {
              console.error('Error fetching lists:', err);
            });
        }
      })
      .catch(error => {
        console.error('Error fetching user status:', error);
      });
  }, []);

  const handleLogout = () => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/logout`)
      .then(() => {
        setUser(null);
        setLists([]);
        navigate('/'); // Navigate to the home page on logout
      })
      .catch(error => {
        console.error('Error logging out:', error);
      });
  };

  const handleSelectList = (listId) => {
    setSelectedListId(listId);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        {user ? (
          <>
            <Header user={user} />
            <Layout
              lists={lists}
              onSelectList={handleSelectList}
              selectedListId={selectedListId}
              handleLogout={handleLogout}
              user={user}
            >
              <Routes>
                <Route path="/" element={<List selectedListId={selectedListId} />} />
                <Route path="/profile" element={<Profile user={user} />} />
                <Route path="/edit-profile" element={<EditProfile user={user} />} />
              </Routes>
            </Layout>
          </>
        ) : (
          <Container sx={{ mt: 4 }}>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
              <img src={octopusLogo} alt="Logo" className="login-logo" />
              <Typography variant="h4" gutterBottom>
                Welcome to My List App
              </Typography>
              <Typography variant="h6" gutterBottom>
                Please log in to manage your lists.
              </Typography>
              <Button variant="contained" color="primary" href={`${process.env.REACT_APP_BACKEND_URL}/auth/discord`}>
                Login with Discord
              </Button>
            </Box>
          </Container>
        )}
      </Router>
    </ThemeProvider>
  );
};

export default App;
