import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Home = () => {
  const { user } = useUser();

  return (
    <div className="home">
      <h1>Welcome to Idea List</h1>
      <p>Create and manage lists of ideas with your friends!</p>
      <div className="features">
        <h2>Features:</h2>
        <ul>
          <li>Create and manage multiple lists</li>
          <li>Add items like Movies, Games, Books, Comics, or Custom entries</li>
          <li>Rate and review your list items</li>
          <li>Collaborate with approved users</li>
        </ul>
      </div>
      {!user ? (
        <div className="cta">
          <Link to="/login" className="btn btn-primary">Sign Up / Log In with Discord</Link>
        </div>
      ) : (
        <div className="cta">
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        </div>
      )}
    </div>
  );
};

export default Home;
