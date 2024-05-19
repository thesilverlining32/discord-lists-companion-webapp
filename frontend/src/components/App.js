// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import List from './List';
import Layout from './Layout';
import Header from './Header';
import Profile from './Profile';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Box, Button } from '@mui/material';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import octopusLogo from '../assets/octopus_logo.png';
import './App.css';

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
      <Router>
        {user ? (
          <>
            <Header user={user} />
            <Switch>
              <Route path="/profile">
                <Profile user={user} />
              </Route>
              <Route path="/">
                <Layout
                  lists={lists}
                  onSelectList={handleSelectList}
                  selectedListId={selectedListId}
                  handleLogout={handleLogout}
                  user={user}
                >
                  <List selectedListId={selectedListId} />
                </Layout>
              </Route>
            </Switch>
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
