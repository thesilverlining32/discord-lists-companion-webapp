// src/components/Layout/Header.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { logout } from '../../services/auth';

const Header = () => {
  const { user, setUser, loading } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  return (
    <header>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          {!loading && (
            user ? (
              <>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li>
              </>
            ) : (
              <li><Link to="/login">Login</Link></li>
            )
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
