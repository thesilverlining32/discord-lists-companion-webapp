import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Button, List as MUIList, ListItem as MUIListItem, ListItemText, Card, CardActions, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const ListItem = ({ listId }) => {
  const [items, setItems] = useState([]);
  const [itemContent, setItemContent] = useState('');
  const [editItemId, setEditItemId] = useState(null);

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

  const handleDeleteItem = (itemId) => {
    axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/lists/${listId}/items/${itemId}`)
      .then(() => {
        setItems(items.filter(item => item._id !== itemId));
      })
      .catch(error => {
        console.error('There was an error deleting the item!', error);
      });
  };

  const handleEditItem = (itemId) => {
    setEditItemId(itemId);
    const item = items.find(item => item._id === itemId);
    setItemContent(item.content);
  };

  const handleUpdateItem = () => {
    axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/lists/${listId}/items/${editItemId}`, { content: itemContent })
      .then(response => {
        setItems(items.map(item => (item._id === editItemId ? response.data : item)));
        setItemContent('');
        setEditItemId(null);
      })
      .catch(error => {
        console.error('There was an error updating the item!', error);
      });
  };

  return (
    <Box>
      <CardActions>
        <TextField
          label="New item"
          variant="outlined"
          value={itemContent}
          onChange={e => setItemContent(e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={editItemId ? handleUpdateItem : handleAddItem}>
          {editItemId ? 'Update Item' : 'Add Item'}
        </Button>
      </CardActions>
      <MUIList>
        {items.map(item => (
          <MUIListItem key={item._id} secondaryAction={
            <>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEditItem(item._id)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteItem(item._id)}>
                <DeleteIcon />
              </IconButton>
            </>
          }>
            <ListItemText primary={item.content} />
          </MUIListItem>
        ))}
      </MUIList>
    </Box>
  );
};

export default ListItem;
