import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Button, List as MUIList, ListItem as MUIListItem, ListItemText, Card, CardActions, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ListItem = ({ listId }) => {
  const [items, setItems] = useState([]);
  const [itemContent, setItemContent] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [editItemId, setEditItemId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

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
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/lists/${listId}/items`, { content: itemContent, description: itemDescription })
      .then(response => {
        if (response.data) {
          setItems([...items, response.data]);
          setSnackbar({ open: true, message: 'Item added successfully!', severity: 'success' });
        }
        setItemContent('');
        setItemDescription('');
      })
      .catch(error => {
        console.error('There was an error adding the item!', error);
        setSnackbar({ open: true, message: 'Error adding item!', severity: 'error' });
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
    handleCloseDeleteDialog();
  };

  const handleEditItem = (itemId) => {
    setEditItemId(itemId);
    const item = items.find(item => item._id === itemId);
    setItemContent(item.content);
    setItemDescription(item.description);
  };

  const handleUpdateItem = () => {
    axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/lists/${listId}/items/${editItemId}`, { content: itemContent, description: itemDescription })
      .then(response => {
        setItems(items.map(item => (item._id === editItemId ? response.data : item)));
        setSnackbar({ open: true, message: 'Item updated successfully!', severity: 'success' });
        setItemContent('');
        setItemDescription('');
        setEditItemId(null);
      })
      .catch(error => {
        console.error('There was an error updating the item!', error);
        setSnackbar({ open: true, message: 'Error updating item!', severity: 'error' });
      });
  };

  const handleOpenDeleteDialog = (itemId) => {
    setDeleteItemId(itemId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteItemId(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  const filteredItems = items.filter(item => item.content.toLowerCase().includes(searchTerm.toLowerCase()));
  const sortedItems = filteredItems.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.content.localeCompare(b.content);
    } else {
      return b.content.localeCompare(a.content);
    }
  });

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
        <TextField
          label="Description"
          variant="outlined"
          value={itemDescription}
          onChange={e => setItemDescription(e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={editItemId ? handleUpdateItem : handleAddItem}>
          {editItemId ? 'Update Item' : 'Add Item'}
        </Button>
      </CardActions>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
        <TextField
          label="Search items"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <FormControl variant="outlined">
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
      <MUIList>
        {sortedItems.map(item => (
          <MUIListItem key={item._id} secondaryAction={
            <>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEditItem(item._id)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDeleteDialog(item._id)}>
                <DeleteIcon />
              </IconButton>
            </>
          }>
            <ListItemText
              primary={item.content}
              secondary={item.description ? item.description : null}
            />
          </MUIListItem>
        ))}
      </MUIList>
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleDeleteItem(deleteItemId)} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ListItem;
