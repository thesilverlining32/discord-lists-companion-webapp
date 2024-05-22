import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Button, CircularProgress, List as MUIList, ListItem as MUIListItem, ListItemText, IconButton, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const ListItem = ({ listId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemContent, setItemContent] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [editItemId, setEditItemId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    if (listId) {
      fetchItems(listId);
    }
  }, [listId]);

  const fetchItems = (listId) => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/lists/${listId}/items`)
      .then(response => {
        setItems(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('There was an error fetching the items!', error);
        setLoading(false);
      });
  };

  const handleAddItem = () => {
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/lists/${listId}/items`, { content: itemContent, description: itemDescription })
      .then(response => {
        setItems([...items, response.data]);
        setItemContent('');
        setItemDescription('');
        setSnackbar({ open: true, message: 'Item added successfully!', severity: 'success' });
      })
      .catch(error => {
        console.error('There was an error adding the item!', error);
        setSnackbar({ open: true, message: 'Error adding item!', severity: 'error' });
      });
  };

  const handleUpdateItem = () => {
    axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/lists/${listId}/items/${editItemId}`, { content: itemContent, description: itemDescription })
      .then(response => {
        setItems(items.map(item => (item._id === editItemId ? response.data : item)));
        setItemContent('');
        setItemDescription('');
        setEditItemId(null);
        setSnackbar({ open: true, message: 'Item updated successfully!', severity: 'success' });
      })
      .catch(error => {
        console.error('There was an error updating the item!', error);
        setSnackbar({ open: true, message: 'Error updating item!', severity: 'error' });
      });
  };

  const handleDeleteItem = (itemId) => {
    axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/lists/${listId}/items/${itemId}`)
      .then(() => {
        setItems(items.filter(item => item._id !== itemId));
        setSnackbar({ open: true, message: 'Item deleted successfully!', severity: 'success' });
      })
      .catch(error => {
        console.error('There was an error deleting the item!', error);
        setSnackbar({ open: true, message: 'Error deleting item!', severity: 'error' });
      });
  };

  const handleEditItem = (itemId) => {
    const item = items.find(item => item._id === itemId);
    setItemContent(item.content);
    setItemDescription(item.description);
    setEditItemId(itemId);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  const filteredItems = items.filter(item => item.content.toLowerCase().includes(searchTerm.toLowerCase()));
  const sortedItems = filteredItems.sort((a, b) => (sortOrder === 'asc' ? a.content.localeCompare(b.content) : b.content.localeCompare(a.content)));

  return (
    <Box>
      <Box mb={2} className="new-item-container">
        <TextField
          label="New item"
          variant="outlined"
          value={itemContent}
          onChange={(e) => setItemContent(e.target.value)}
          fullWidth
          className="new-item-input"
        />
        <TextField
          label="Description"
          variant="outlined"
          value={itemDescription}
          onChange={(e) => setItemDescription(e.target.value)}
          fullWidth
          className="new-item-description"
        />
        <Button variant="contained" color="primary" onClick={editItemId ? handleUpdateItem : handleAddItem} fullWidth className="add-item-button">
          {editItemId ? 'Update Item' : 'Add Item'}
        </Button>
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} className="search-sort-box">
        <TextField
          label="Search items"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-field"
        />
        <FormControl variant="outlined" className="sort-field">
          <InputLabel>Sort</InputLabel>
          <Select
            value={sortOrder}
            onChange={handleSortOrderChange}
            label="Sort"
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <MUIList>
          {sortedItems.map(item => (
            <MUIListItem key={item._id} className="list-item">
              <ListItemText
                primary={item.content}
                secondary={item.description}
                className="list-item-text"
              />
              <IconButton edge="end" aria-label="edit" onClick={() => handleEditItem(item._id)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteItem(item._id)}>
                <DeleteIcon />
              </IconButton>
            </MUIListItem>
          ))}
        </MUIList>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ListItem;
