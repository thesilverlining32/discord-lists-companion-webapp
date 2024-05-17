import React from 'react';
import { Box, Drawer, CssBaseline, AppBar, Toolbar, Typography, List, ListItem, ListItemText, Button } from '@mui/material';

const drawerWidth = 240;

const Layout = ({ children, lists, onSelectList, selectedListId, handleLogout, user }) => {
	return (
		<Box sx={{ display: 'flex' }}>
			<CssBaseline />
			<AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
				<Toolbar>
					<Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
						My List App
					</Typography>
					{user ? (
						<Button color="inherit" onClick={handleLogout}>Logout</Button>
					) : (
						<Button color="inherit" href={`${process.env.REACT_APP_BACKEND_URL}/auth/discord`}>Login with Discord</Button>
					)}
				</Toolbar>
			</AppBar>
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
