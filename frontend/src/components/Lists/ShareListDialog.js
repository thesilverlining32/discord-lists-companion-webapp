import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { searchUsers, shareList, getListShares, removeListShare, setListPublic } from '../../services/api';
import './ShareListDialog.css';

const ShareListDialog = ({ list, isOpen, onClose, onListUpdated }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [selectedPermission, setSelectedPermission] = useState('read');
  const [isPublic, setIsPublic] = useState(list?.is_public || false);

  useEffect(() => {
    if (list && isOpen) {
      fetchSharedUsers();
      setIsPublic(list.is_public || false);
    }
  }, [list, isOpen]);

  const fetchSharedUsers = async () => {
    if (!list) return;

    setIsLoading(true);
    try {
      const response = await getListShares(list._id);
      setSharedUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching shared users:', err);
      setError('Failed to load sharing information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await searchUsers(searchQuery);
      setSearchResults(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleShareWithUser = async (userId) => {
    try {
      await shareList(list._id, userId, selectedPermission);
      await fetchSharedUsers();
      // Clear search results after sharing
      setSearchResults([]);
      setSearchQuery('');
      setError(null);
      if (onListUpdated) onListUpdated();
    } catch (err) {
      console.error('Error sharing list:', err);
      setError(err.response?.data?.detail || 'Failed to share list');
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await removeListShare(list._id, userId);
      await fetchSharedUsers();
      setError(null);
      if (onListUpdated) onListUpdated();
    } catch (err) {
      console.error('Error removing user:', err);
      setError(err.response?.data?.detail || 'Failed to remove user from shared list');
    }
  };

  const handleSetPublic = async (value) => {
    try {
      await setListPublic(list._id, value);
      setIsPublic(value);
      setError(null);
      if (onListUpdated) onListUpdated();
    } catch (err) {
      console.error('Error updating list visibility:', err);
      setError(err.response?.data?.detail || 'Failed to update list visibility');
    }
  };

  const getPermissionLabel = (permission) => {
    switch (permission) {
      case 'read': return 'Can view';
      case 'create': return 'Can add items';
      case 'edit': return 'Can edit';
      case 'delete': return 'Can delete';
      default: return permission;
    }
  };

  if (!list) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share "{list.name}"</DialogTitle>
          <DialogDescription>
            Share your list with other users or make it public
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Share with Users</TabsTrigger>
            <TabsTrigger value="public">Public Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <div className="space-y-4">
              {/* Search for users */}
              <form onSubmit={handleSearch} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by username or email"
                    className="flex-1 px-3 py-2 border rounded"
                    disabled={isSearching}
                    required
                  />
                  <select
                    value={selectedPermission}
                    onChange={(e) => setSelectedPermission(e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="read">Can view</option>
                    <option value="create">Can add items</option>
                    <option value="edit">Can edit</option>
                    <option value="delete">Can delete</option>
                  </select>
                  <Button type="submit" disabled={isSearching}>
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </form>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <h3 className="px-4 py-2 font-medium bg-gray-50">Search Results</h3>
                  <ul className="divide-y">
                    {searchResults.map((user) => (
                      <li key={user._id} className="px-4 py-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleShareWithUser(user._id)}
                        >
                          Share
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Currently shared users */}
              <div className="border rounded-md overflow-hidden">
                <h3 className="px-4 py-2 font-medium bg-gray-50">Shared With</h3>
                {isLoading ? (
                  <p className="p-4 text-center">Loading...</p>
                ) : sharedUsers.length === 0 ? (
                  <p className="p-4 text-center text-gray-500">This list is not shared with anyone yet</p>
                ) : (
                  <ul className="divide-y">
                    {sharedUsers.map((share) => (
                      <li key={share.user_id} className="px-4 py-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{share.username || 'Unknown User'}</p>
                          <p className="text-sm text-gray-500">{getPermissionLabel(share.permission_level)}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveUser(share.user_id)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="public" className="mt-4">
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Public Access</h3>
                <p className="text-sm text-gray-500 mb-4">
                  When a list is public, anyone with the link can view it without being explicitly shared.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="private"
                      name="visibility"
                      checked={!isPublic}
                      onChange={() => handleSetPublic(false)}
                    />
                    <label htmlFor="private">
                      <span className="font-medium">Private</span>
                      <p className="text-sm text-gray-500">Only you and people you share with can access</p>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="public"
                      name="visibility"
                      checked={isPublic}
                      onChange={() => handleSetPublic(true)}
                    />
                    <label htmlFor="public">
                      <span className="font-medium">Public</span>
                      <p className="text-sm text-gray-500">Anyone with the link can view this list</p>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareListDialog;
