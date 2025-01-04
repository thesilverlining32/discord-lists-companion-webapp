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
      console.log('Fetched lists:', response.data);
      setLists(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching lists:', err);
      setError('Failed to fetch lists. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="dashboard-loading">Loading your lists...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome, {user.username}!</h1>
          <p className="subtitle">Manage and organize your collections</p>
        </div>
        <Link to="/lists/new" className="btn btn-primary create-list-btn">
          <span className="btn-icon">+</span>
          Create New List
        </Link>
      </header>

      <section className="lists-section">
        <h2>My Lists</h2>

        {lists.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No Lists Yet</h3>
            <p>Create your first list to get started!</p>
            <Link to="/lists/new" className="btn btn-primary">Create List</Link>
          </div>
        ) : (
          <div className="lists-grid">
            {lists.map(list => (
              <Link to={`/lists/${list._id}`} key={list._id} className="list-card">
                <div className="list-card-content">
                  <h3 className="list-title">{list.name}</h3>
                  {list.description && (
                    <p className="list-description">{list.description}</p>
                  )}
                  <div className="list-meta">
                    <span className="item-count">
                      {list.item_count} {list.item_count === 1 ? 'item' : 'items'}
                    </span>
                    <span className="view-details">View Details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
