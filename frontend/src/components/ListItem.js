import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, TextField, Button, CircularProgress, List as MUIList,
  ListItem as MUIListItem, ListItemText, IconButton, FormControl,
  InputLabel, Select, MenuItem, Snackbar, Alert, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const ListItem = ({ listId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemContent, setItemContent] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [category, setCategory] = useState('');
  const [editItemId, setEditItemId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [openDialog, setOpenDialog] = useState(false);

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
    // Fetch metadata based on category and content
    fetchMetadata(category, itemContent).then(metadata => {
      axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/lists/${listId}/items`, {
        content: itemContent,
        description: itemDescription,
        category: category,
        metadata: metadata
      })
        .then(response => {
          setItems([...items, response.data]);
          setItemContent('');
          setItemDescription('');
          setCategory('');
          setSnackbar({ open: true, message: 'Item added successfully!', severity: 'success' });
          setOpenDialog(false);
        })
        .catch(error => {
          console.error('There was an error adding the item!', error);
          setSnackbar({ open: true, message: 'Error adding item!', severity: 'error' });
        });
    });
  };

  const fetchMetadata = async (category, searchTerm) => {
    let metadata = {};
    if (category === 'Movie') {
      // Example with OMDB API
      const response = await axios.get(`http://www.omdbapi.com/?t=${searchTerm}&apikey=YOUR_OMDB_API_KEY`);
      const data = response.data;
      metadata = {
        title: data.Title,
        description: data.Plot,
        imageUrl: data.Poster,
      };
    } else if (category === 'Game') {
      // Example with IGDB API
      const response = await axios.post(`https://api.igdb.com/v4/games`, {
        headers: {
          'Client-ID': 'YOUR_IGDB_CLIENT_ID',
          'Authorization': 'Bearer YOUR_IGDB_ACCESS_TOKEN'
        },
        data: `search "${searchTerm}"; fields name, summary, cover.url;`
      });
      const data = response.data[0];
      metadata = {
        title: data.name,
        description: data.summary,
        imageUrl: data.cover?.url,
      };
    } else if (category === 'TV Show') {
      // Add TV Show metadata fetching logic here
    }
    return metadata;
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
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
      <Button variant="contained" color="primary" onClick={handleDialogOpen}>Add Item</Button>
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To add a new item, please select a category and enter the name of the item.
          </DialogContentText>
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="Movie">Movie</MenuItem>
              <MenuItem value="Game">Game</MenuItem>
              <MenuItem value="TV Show">TV Show</MenuItem>
            </Select>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            label="Item Name"
            type="text"
            fullWidth
            value={itemContent}
            onChange={(e) => setItemContent(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddItem} color="primary">
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
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
