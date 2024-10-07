import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Dashboard = () => {
  const { user } = useUser();
  const [lists, setLists] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Fetch user's lists and recent activity
    // This is where you'd make API calls to your backend
    // For now, we'll use dummy data
    setLists([
      { id: 1, name: 'Movies to Watch', itemCount: 5 },
      { id: 2, name: 'Books to Read', itemCount: 3 },
    ]);
    setRecentActivity([
      { id: 1, action: 'Added "Inception" to Movies to Watch' },
      { id: 2, action: 'Rated "The Great Gatsby" in Books to Read' },
    ]);
  }, []);

  return (
    <div className="dashboard">
      <h1>Welcome, {user.username}!</h1>
      <section className="my-lists">
        <h2>My Lists</h2>
        <ul>
          {lists.map(list => (
            <li key={list.id}>
              <Link to={`/list/${list.id}`}>{list.name}</Link> ({list.itemCount} items)
            </li>
          ))}
        </ul>
        <Link to="/lists" className="btn btn-secondary">View All Lists</Link>
      </section>
      <section className="recent-activity">
        <h2>Recent Activity</h2>
        <ul>
          {recentActivity.map(activity => (
            <li key={activity.id}>{activity.action}</li>
          ))}
        </ul>
      </section>
      <Link to="/lists/new" className="btn btn-primary">Create New List</Link>
    </div>
  );
};

export default Dashboard;
