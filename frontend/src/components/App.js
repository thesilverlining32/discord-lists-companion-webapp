import React, { useState, useEffect } from 'react';
import axios from 'axios';
import List from './List';
import Layout from './Layout';
import Header from './Header';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Typography, Container, Button, Box } from '@mui/material';

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

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/status`)
      .then(response => {
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
      <Header user={user} handleLogout={handleLogout} />
      {user ? (
        <Layout
          lists={lists}
          onSelectList={handleSelectList}
          selectedListId={selectedListId}
          handleLogout={handleLogout}
          user={user}
        >
          <List selectedListId={selectedListId} />
        </Layout>
      ) : (
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '100vh' }}>
          <Typography variant="h4" gutterBottom>
            Welcome to My List App
          </Typography>
          <Typography variant="h6" gutterBottom>
            Please log in to manage your lists.
          </Typography>
          <Button color="primary" variant="contained" href={`${process.env.REACT_APP_BACKEND_URL}/auth/discord`}>
            Login with Discord
          </Button>
        </Container>
      )}
    </ThemeProvider>
  );
};

export default App;
