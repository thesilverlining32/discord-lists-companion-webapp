import React, { useState, useEffect } from 'react';
import axios from 'axios';
import List from './List';
import Layout from './Layout';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Typography, Container } from '@mui/material';

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
  const [selectedListId, setSelectedListId] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/status`)
      .then(response => {
        setUser(response.data.user);
      })
      .catch(error => {
        console.error('Error fetching user status:', error);
      });
  }, []);

  const handleLogout = () => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/logout`)
      .then(() => {
        setUser(null);
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
      {user ? (
        <Layout
          lists={user.lists} // Pass lists from user if available
          onSelectList={handleSelectList}
          selectedListId={selectedListId}
          handleLogout={handleLogout}
          user={user}
        >
          <List selectedListId={selectedListId} />
        </Layout>
      ) : (
        <Container sx={{ mt: 4 }}>
          <Typography variant="h6">
            Please log in to manage your lists.
          </Typography>
        </Container>
      )}
    </ThemeProvider>
  );
};

export default App;
