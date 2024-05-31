import React, { useState } from 'react';
import { Box, IconButton, Menu, MenuItem, ListItem as MUIListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const List = ({ lists, handleEdit, handleDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedList, setSelectedList] = useState(null);

  const handleMenuOpen = (event, list) => {
    setAnchorEl(event.currentTarget);
    setSelectedList(list);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedList(null);
  };

  const handleEditClick = () => {
    handleEdit(selectedList);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    handleDelete(selectedList);
    handleMenuClose();
  };

  return (
    <Box>
      {lists.map(list => (
        <MUIListItem key={list._id} divider>
          <ListItemText primary={list.name} secondary={list.description} />
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="more" onClick={(e) => handleMenuOpen(e, list)}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEditClick}>
                <EditIcon /> Edit
              </MenuItem>
              <MenuItem onClick={handleDeleteClick}>
                <DeleteIcon /> Delete
              </MenuItem>
            </Menu>
          </ListItemSecondaryAction>
        </MUIListItem>
      ))}
    </Box>
  );
};

export default List;
