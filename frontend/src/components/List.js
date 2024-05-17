import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListItem from './ListItem';
import { Box, TextField, Button, Typography, List as MUIList, ListItem as MUIListItem, ListItemText, Card, CardContent, CardActions } from '@mui/material';

const List = () => {
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {lists.map(list => (
          <Card key={list._id}>
            <CardContent>
              <Typography variant="h5" component="div">
                {list.name}
              </Typography>
              <ListItem listId={list._id} />
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default List;
