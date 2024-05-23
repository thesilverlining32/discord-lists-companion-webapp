import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText, IconButton } from '@mui/material';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ListItemComponent from './ListItem';  // Import the ListItem component

const Layout = ({ lists, onSelectList, selectedListId, setLists, user }) => {
  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editingListName, setEditingListName] = useState('');

  const handleAddList = () => {
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/lists`, { name: newListName })
      .then(response => {
        setLists([...lists, response.data]);
        setNewListName('');
      })
      .catch(error => {
        console.error('There was an error creating the list!', error);
      });
  };

  const handleEditList = (listId, listName) => {
    setEditingListId(listId);
    setEditingListName(listName);
  };

  const handleUpdateList = () => {
    axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/lists/${editingListId}`, { name: editingListName })
      .then(response => {
        const updatedLists = lists.map(list => list._id === editingListId ? response.data : list);
        setLists(updatedLists);
        setEditingListId(null);
        setEditingListName('');
      })
      .catch(error => {
        console.error('There was an error updating the list!', error);
      });
  };

  const handleDeleteList = (listId) => {
    axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/lists/${listId}`)
      .then(response => {
        setLists(lists.filter(list => list._id !== listId));
      })
      .catch(error => {
        console.error('There was an error deleting the list!', error);
      });
  };

  useEffect(() => {
    if (lists.length > 0 && !selectedListId) {
      onSelectList(lists[0]._id);
    }
  }, [lists, selectedListId, onSelectList]);

  return (
    <Box display="flex">
      <Box width="250px" p={2} bgcolor="background.paper">
        <TextField
          label="New list name"
          variant="outlined"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          fullWidth
          className="new-list-name-input"
        />
        <Button variant="contained" color="primary" onClick={handleAddList} fullWidth className="add-list-button">
          Add List
        </Button>
        <List>
          {lists.map((list) => (
            <ListItem
              key={list._id}
              button
              selected={list._id === selectedListId}
              onClick={() => onSelectList(list._id)}
              className="list-item"
            >
              <ListItemText primary={list.name} />
              {list.items.length === 0 && (
                <>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleEditList(list._id, list.name)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteList(list._id)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              )}
            </ListItem>
          ))}
        </List>
        {editingListId && (
          <Box mt={2}>
            <TextField
              label="Edit list name"
              variant="outlined"
              value={editingListName}
              onChange={(e) => setEditingListName(e.target.value)}
              fullWidth
            />
            <Button variant="contained" color="primary" onClick={handleUpdateList} fullWidth>
              Update List
            </Button>
          </Box>
        )}
      </Box>
      <Box flexGrow={1} p={2}>
        {selectedListId && <ListItemComponent listId={selectedListId} />}
      </Box>
    </Box>
  );
};

export default Layout;
