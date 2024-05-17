import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Button, List as MUIList, ListItem as MUIListItem, ListItemText } from '@mui/material';

const ListItem = ({ listId }) => {
  const [items, setItems] = useState([]);
  const [itemContent, setItemContent] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/lists/${listId}/items`)
      .then(response => {
        if (Array.isArray(response.data)) {
          setItems(response.data);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the items!', error);
      });
  }, [listId]);

  const handleAddItem = () => {
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/lists/${listId}/items`, { content: itemContent })
      .then(response => {
        if (response.data) {
          setItems([...items, response.data]);
        }
        setItemContent('');
      })
      .catch(error => {
        console.error('There was an error adding the item!', error);
      });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="New item"
          variant="outlined"
          value={itemContent}
          onChange={e => setItemContent(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleAddItem}>Add Item</Button>
      </Box>
      <MUIList>
        {items.map(item => (
          <MUIListItem key={item._id}>
            <ListItemText primary={item.content} />
          </MUIListItem>
        ))}
      </MUIList>
    </Box>
  );
};

export default ListItem;
