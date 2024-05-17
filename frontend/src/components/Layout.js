import React from 'react';
import { Box, Drawer, CssBaseline, AppBar, Toolbar, Typography, List, ListItem, ListItemText } from '@mui/material';

const drawerWidth = 240;

const Layout = ({ children, lists, onSelectList, selectedListId }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {lists.map((list) => (
              <ListItem button key={list._id} onClick={() => onSelectList(list._id)} selected={list._id === selectedListId}>
                <ListItemText primary={list.name} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
