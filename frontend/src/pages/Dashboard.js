import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getLists } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useUser();
  const [lists, setLists] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getLists();
        setLists(response.data);
        // For now, we'll use dummy data for recent activity
        setRecentActivity([
          { id: 1, action: 'Added "Inception" to Movies to Watch' },
          { id: 2, action: 'Rated "The Great Gatsby" in Books to Read' },
        ]);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Welcome, {user.username}!</h1>
      <div className="dashboard-content">
        <section className="my-lists">
          <h2>My Lists</h2>
          {lists.length === 0 ? (
            <p>You don't have any lists yet. Create one to get started!</p>
          ) : (
            <ul>
              {lists.map(list => (
                <li key={list.id}>
                  <Link to={`/list/${list.id}`}>{list.name}</Link> ({list.items ? list.items.length : 0} items)
                </li>
              ))}
            </ul>
          )}
          <Link to="/lists" className="btn btn-secondary">View All Lists</Link>
        </section>
        <section className="recent-activity">
          <h2>Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p>No recent activity.</p>
          ) : (
            <ul>
              {recentActivity.map(activity => (
                <li key={activity.id}>{activity.action}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <Link to="/lists/new" className="btn btn-primary">Create New List</Link>
    </div>
  );
};

export default Dashboard;
