import React, { useState, useEffect } from 'react';
import axios from 'axios';
import List from './List';
import Layout from './Layout';
import Header from './Header';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography } from '@mui/material';

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
      <Header user={user} onLogout={handleLogout} />
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
