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
      setLists(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch lists. Please try again.');
      console.error('Error fetching lists:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard">
      <h1>Welcome, {user.username}!</h1>
      <section className="my-lists">
        <h2>My Lists</h2>
        {lists.length === 0 ? (
          <p>You don't have any lists yet. Create one to get started!</p>
        ) : (
          <ul>
            {lists.map(list => (
              <li key={list.id}>
                <Link to={`/list/${list.id}`}>{list.name}</Link>
              </li>
            ))}
          </ul>
        )}
        <Link to="/lists/new" className="btn btn-primary">Create New List</Link>
      </section>
    </div>
  );
};

export default Dashboard;
