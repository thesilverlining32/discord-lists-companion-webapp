import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, TextField, Button, CircularProgress, List as MUIList, ListItem as MUIListItem,
  ListItemText, IconButton, FormControl, InputLabel, Select, MenuItem, Snackbar,
  Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  ListSubheader
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

const ListItem = ({ listId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemContent, setItemContent] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [editItemId, setEditItemId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [category, setCategory] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [addItemSearchTerm, setAddItemSearchTerm] = useState('');


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

  const handleSearch = async () => {
    let results = [];
    if (category === 'Movie') {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/omdb-key`);
      const omdbApiKey = response.data.apiKey;
      const movieResponse = await axios.get(`https://www.omdbapi.com/?s=${addItemSearchTerm}&apikey=${omdbApiKey}`);
      results = movieResponse.data.Search.map(movie => ({
        title: movie.Title,
        description: `Year: ${movie.Year}`,
        imageUrl: movie.Poster,
        metadata: {
          title: movie.Title,
          description: `Year: ${movie.Year}`,
          imageUrl: movie.Poster,
        }
      }));
    }
    setSearchResults(results);
  };

  const handleAddItem = () => {
    const newItem = {
      content: itemContent,
      description: itemDescription,
      category,
      metadata: selectedResult ? selectedResult.metadata : {}
    };

    axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/lists/${listId}/items`, newItem)
      .then(response => {
        setItems([...items, response.data]);
        setItemContent('');
        setItemDescription('');
        setSnackbar({ open: true, message: 'Item added successfully!', severity: 'success' });
        setOpenAddDialog(false);
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

  const handleAddItemSearchChange = (event) => {
    setAddItemSearchTerm(event.target.value);
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  };

  const filteredItems = items.filter(item => {
    const searchTermLower = searchTerm.toLowerCase();
    const contentMatch = item.content.toLowerCase().includes(searchTermLower);
    const titleMatch = item.metadata && item.metadata.title ? item.metadata.title.toLowerCase().includes(searchTermLower) : false;
    return contentMatch || titleMatch;
});

const sortedItems = filteredItems.sort((a, b) =>
    sortOrder === 'asc' ? a.content.localeCompare(b.content) : b.content.localeCompare(a.content)
);

  return (
    <Box>
      <Box mb={2} display="flex" justifyContent="space-between">
        <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)} startIcon={<AddIcon />}>
          Add Item
        </Button>
        <Box display="flex" justifyContent="space-between" alignItems="center" className="search-sort-box">
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
      </Box>
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Search for New Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the details for the new item.
          </DialogContentText>
          <FormControl fullWidth variant="outlined" margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="Movie">Movie</MenuItem>
              <MenuItem value="Game">Game</MenuItem>
              <MenuItem value="TV Show">TV Show</MenuItem>
              <MenuItem value="Music">Music</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Search Term"
            type="text"
            fullWidth
            variant="outlined"
            value={addItemSearchTerm} // Use new state variable
            onChange={handleAddItemSearchChange} // Use new handler
            disabled={category === 'Other'}
          />
          <Button onClick={handleSearch} color="primary" variant="contained" fullWidth disabled={category === 'Other'}>
            Search
          </Button>
          {searchResults.length > 0 && (
            <Box mt={2}>
              <ListSubheader>Search Results</ListSubheader>
              <MUIList>
                {searchResults.map((result, index) => (
                  <MUIListItem
                    key={index}
                    button
                    selected={selectedResult === result}
                    onClick={() => setSelectedResult(result)}
                  >
                    {result.imageUrl && (
                      <img src={result.imageUrl} alt={result.title} style={{ width: '50px', marginRight: '10px' }} />
                    )}
                    <ListItemText
                      primary={result.title}
                      secondary={result.description}
                    />
                  </MUIListItem>
                ))}
              </MUIList>
            </Box>
          )}
          {category === 'Other' && (
            <>
              <TextField
                margin="dense"
                label="Item Content"
                type="text"
                fullWidth
                variant="outlined"
                value={itemContent}
                onChange={(e) => setItemContent(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Description"
                type="text"
                fullWidth
                variant="outlined"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddItem} color="primary" disabled={category !== 'Other' && !selectedResult}>
            Add Item
          </Button>
        </DialogActions>
      </Dialog>
      <MUIList>
        {sortedItems.map(item => (
          <MUIListItem key={item._id} className="list-item">
            <ListItemText
              primary={item.metadata?.title || item.content}
              secondary={item.metadata?.description || item.description}
              className="list-item-text"
            />
            {item.metadata?.imageUrl && (
              <img src={item.metadata.imageUrl} alt={item.metadata.title} style={{ width: '50px', marginRight: '10px' }} />
            )}
            <IconButton edge="end" aria-label="edit" onClick={() => handleEditItem(item._id)}>
              <EditIcon />
            </IconButton>
            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteItem(item._id)}>
              <DeleteIcon />
            </IconButton>
          </MUIListItem>
        ))}
      </MUIList>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ListItem;
