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
import { Badge } from '../ui/badge';
import { Users, Search, UserPlus } from 'lucide-react';
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

  const permissionOptions = [
    { value: 'read', label: 'Can view', description: 'Users can only view the list and its items' },
    { value: 'create', label: 'Can add items', description: 'Users can view and add new items to the list' },
    { value: 'edit', label: 'Can edit', description: 'Users can view, add, and edit items in the list' },
    { value: 'delete', label: 'Can delete', description: 'Users have full control except for sharing' },
  ];

  if (!list) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Share "{list.name}"</DialogTitle>
          <DialogDescription>
            Share your list with other users or make it public
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="my-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="users" className="py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Share with Users
            </TabsTrigger>
            <TabsTrigger value="public" className="py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Public Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            {/* Search for users */}
            <form onSubmit={handleSearch} className="space-y-2">
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Add people</h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by username or email"
                    className="block w-full pl-10 pr-3 py-2 border rounded-md"
                    disabled={isSearching}
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium mb-2">Permission level:</label>
                  <div className="grid grid-cols-1 gap-2">
                    {permissionOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer ${
                          selectedPermission === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center h-5">
                          <input
                            type="radio"
                            name="permission"
                            value={option.value}
                            checked={selectedPermission === option.value}
                            onChange={() => setSelectedPermission(option.value)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <span className="block text-sm font-medium text-gray-700">{option.label}</span>
                          <span className="block text-sm text-gray-500 mt-1">{option.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </div>
            </form>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="border rounded-md overflow-hidden">
                <h3 className="px-4 py-2 font-medium bg-gray-50 border-b">Search Results</h3>
                <ul className="divide-y max-h-64 overflow-y-auto">
                  {searchResults.map((user) => (
                    <li key={user._id} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleShareWithUser(user._id)}
                        className="flex items-center"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Currently shared users */}
            <div className="border rounded-md overflow-hidden">
              <h3 className="px-4 py-2 font-medium bg-gray-50 border-b">People with access</h3>
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                  <p className="mt-2 text-sm text-gray-500">Loading...</p>
                </div>
              ) : sharedUsers.length === 0 ? (
                <p className="p-4 text-center text-gray-500">This list is not shared with anyone yet</p>
              ) : (
                <ul className="divide-y max-h-64 overflow-y-auto">
                  {sharedUsers.map((share) => (
                    <li key={share.user_id} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{share.username || 'Unknown User'}</p>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="text-xs">
                            {permissionOptions.find(p => p.value === share.permission_level)?.label || share.permission_level}
                          </Badge>
                        </div>
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
          </TabsContent>

          <TabsContent value="public" className="space-y-4">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-4">Public Access</h3>
              <p className="text-sm text-gray-500 mb-4">
                When a list is public, anyone with the link can view it without being explicitly shared.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <label
                  className={`flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer ${
                    !isPublic ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name="visibility"
                      checked={!isPublic}
                      onChange={() => handleSetPublic(false)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <span className="block text-sm font-medium text-gray-700">Private</span>
                    <span className="block text-sm text-gray-500 mt-1">Only you and people you share with can access</span>
                  </div>
                </label>

                <label
                  className={`flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer ${
                    isPublic ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name="visibility"
                      checked={isPublic}
                      onChange={() => handleSetPublic(true)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <span className="block text-sm font-medium text-gray-700">Public</span>
                    <span className="block text-sm text-gray-500 mt-1">Anyone with the link can view this list</span>
                  </div>
                </label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button onClick={onClose} className="w-full sm:w-auto">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareListDialog;
