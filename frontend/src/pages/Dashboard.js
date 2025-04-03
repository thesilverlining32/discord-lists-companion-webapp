// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getLists } from '../services/api';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertCircle, Share2, Plus, Users } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useUser();
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setIsLoading(true);
      const response = await getLists();
      console.log('Fetched lists:', response.data);

      // Log the current user ID for debugging
      console.log('Current user ID:', user?.id);
      response.data.forEach(list => {
        console.log(`List ${list.name} owner_id: ${list.owner_id}`);
      });

      setLists(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching lists:', err);
      setError('Failed to fetch lists. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getListOwnershipStatus = (list) => {
    // Log for debugging
    console.log(`Checking ownership for list: ${list.name}`);
    console.log(`List owner_id: ${list.owner_id}, User id: ${user.id}`);

    if (list.owner_id === user.id) {
      return 'owner';
    }

    const isSharedWithUser = list.shared_with?.some(share => share.user_id === user.id);
    if (isSharedWithUser) {
      return 'shared';
    }

    if (list.is_public) {
      return 'public';
    }

    return 'unknown';
  };

  if (isLoading) return <div className="dashboard-loading">Loading your lists...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  // Important: Here's where we check for ownership - make sure IDs match exactly
  const ownedLists = lists.filter(list => list.owner_id === user.id);
  const sharedLists = lists.filter(list => list.owner_id !== user.id);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome, {user.username}!</h1>
          <p className="subtitle">Manage and organize your collections</p>
        </div>
        <Link to="/lists/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New List
          </Button>
        </Link>
      </header>

      {/* My Lists Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">My Lists</h2>

        {ownedLists.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No Lists Yet</h3>
            <p>Create your first list to get started!</p>
            <Link to="/lists/new">
              <Button>Create List</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {ownedLists.map(list => (
              <Card key={list._id} className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle>{list.name}</CardTitle>
                    <div className="flex gap-1">
                      {list.is_public && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Public
                        </Badge>
                      )}
                      {list.shared_with?.length > 0 && (
                        <Badge variant="outline" className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {list.shared_with.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {list.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    {list.item_count} {list.item_count === 1 ? 'item' : 'items'}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 justify-between">
                  <Link to={`/lists/${list._id}`}>
                    <Button variant="outline" size="sm">View List</Button>
                  </Link>
                  <Badge>Owner</Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Shared With Me Section */}
      {sharedLists.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Shared With Me</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sharedLists.map(list => {
              const ownershipStatus = getListOwnershipStatus(list);
              const permissionLevel = list.shared_with?.find(share => share.user_id === user.id)?.permission_level;

              return (
                <Card key={list._id} className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{list.name}</CardTitle>
                      {list.is_public && ownershipStatus === 'public' && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Public
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {list.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      {list.item_count} {list.item_count === 1 ? 'item' : 'items'}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 justify-between">
                    <Link to={`/lists/${list._id}`}>
                      <Button variant="outline" size="sm">View List</Button>
                    </Link>
                    {ownershipStatus === 'shared' && permissionLevel && (
                      <Badge variant="secondary">
                        {permissionLevel.charAt(0).toUpperCase() + permissionLevel.slice(1)}
                      </Badge>
                    )}
                    {ownershipStatus === 'public' && (
                      <Badge variant="secondary">Public</Badge>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
