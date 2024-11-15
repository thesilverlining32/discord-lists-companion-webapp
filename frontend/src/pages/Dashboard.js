// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getLists } from '../services/api';
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
      console.log('Fetched lists:', response.data); // Debug log
      setLists(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching lists:', err);
      setError('Failed to fetch lists. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="dashboard-loading">Loading...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="dashboard">
      <h1>Welcome, {user.username}!</h1>

      <section className="my-lists">
        <div className="section-header">
          <h2>My Lists</h2>
          <Link to="/lists/new" className="btn btn-primary">Create New List</Link>
        </div>

        {lists.length === 0 ? (
          <div className="no-lists">
            <p>You don't have any lists yet.</p>
          </div>
        ) : (
          <ul className="lists-grid">
            {lists.map(list => (
              <li key={list._id} className="list-card">
                <Link to={`/lists/${list._id}`} className="list-link">
                  <h3>{list.name}</h3>
                  {list.description && <p>{list.description}</p>}
                  <span className="item-count">
                    {list.items?.length || 0} items
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
