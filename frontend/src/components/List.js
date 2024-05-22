import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, List as MUIList, ListItem as MUIListItem, ListItemText, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const List = ({ selectedListId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedListId) {
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/lists/${selectedListId}/items`)
        .then(response => {
          setItems(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('There was an error fetching the items!', error);
          setLoading(false);
        });
    }
  }, [selectedListId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!selectedListId) {
    return <Typography>Select a list to view items.</Typography>;
  }

  return (
    <Box>
      <MUIList>
        {items.map(item => (
          <MUIListItem key={item._id}>
            <ListItemText primary={item.content} secondary={item.description} />
            <IconButton edge="end" aria-label="edit">
              <EditIcon />
            </IconButton>
            <IconButton edge="end" aria-label="delete">
              <DeleteIcon />
            </IconButton>
          </MUIListItem>
        ))}
      </MUIList>
    </Box>
  );
};

export default List;
