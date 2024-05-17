import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListItem from './ListItem';
import { Box, TextField, Button, Typography, Card, CardContent } from '@mui/material';

const List = ({ selectedListId }) => {
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/lists`)
      .then(response => {
        if (Array.isArray(response.data)) {
          setLists(response.data);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the lists!', error);
      });
  }, []);

  const handleAddList = () => {
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/lists`, { name: listName })
      .then(response => {
        if (response.data) {
          setLists([...lists, response.data]);
        }
        setListName('');
      })
      .catch(error => {
        console.error('There was an error creating the list!', error);
      });
  };

  const selectedList = lists.find(list => list._id === selectedListId);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Lists</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          label="New list name"
          variant="outlined"
          value={listName}
          onChange={e => setListName(e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleAddList}>Add List</Button>
      </Box>
      {selectedList ? (
        <Card>
          <CardContent>
            <Typography variant="h5" component="div">
              {selectedList.name}
            </Typography>
            <ListItem listId={selectedList._id} />
          </CardContent>
        </Card>
      ) : (
        <Typography variant="h6" color="textSecondary">
          Select a list to view items
        </Typography>
      )}
    </Box>
  );
};

export default List;
