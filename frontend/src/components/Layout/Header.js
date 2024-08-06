import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const Header = () => {
  const { user, loading } = useUser();

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
                <li><button onClick={() => {/* Implement logout */}}>Logout</button></li>
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
