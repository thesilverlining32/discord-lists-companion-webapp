// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import './Home.css';

const Home = () => {
  const { user } = useUser();

  return (
    <div className="home">
      <div className="hero-section">
        <h1>Welcome to Idea List</h1>
        <p className="hero-subtitle">Create and manage lists of ideas with your friends!</p>

        {!user ? (
          <Link to="/login" className="cta-button">
            Sign Up / Log In with Discord
          </Link>
        ) : (
          <Link to="/dashboard" className="cta-button">
            Go to Dashboard
          </Link>
        )}
      </div>

      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Multiple Lists</h3>
            <p>Create and manage multiple lists to organize different collections</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎬</div>
            <h3>Rich Content</h3>
            <p>Add items like Movies, Games, Books, Comics, or Custom entries</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Rate & Review</h3>
            <p>Rate and review your list items to track your favorites</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Collaboration</h3>
            <p>Collaborate with approved users on shared lists</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
