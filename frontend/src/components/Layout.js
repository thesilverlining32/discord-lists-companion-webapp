import React from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText } from '@mui/material';

const Layout = ({ lists, onSelectList, selectedListId, children }) => {
  const [newListName, setNewListName] = useState('');

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

  return (
    <Box display="flex">
      <Box width="250px" p={2} bgcolor="background.paper">
        <TextField
          label="New list name"
          variant="outlined"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleAddList} fullWidth>
          Add List
        </Button>
        <List>
          {lists.map((list) => (
            <ListItem
              key={list._id}
              button
              selected={list._id === selectedListId}
              onClick={() => onSelectList(list._id)}
            >
              <ListItemText primary={list.name} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box flexGrow={1} p={2}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
