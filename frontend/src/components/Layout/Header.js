import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { logout } from '../../services/auth';
import './Header.css';

const Header = () => {
  const { user, setUser, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  const isActiveLink = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          Idea List
        </Link>

        {!loading && (
          <nav>
            <ul className="nav-links">
              <li>
                <Link to="/" className={isActiveLink('/')}>
                  Home
                </Link>
              </li>
              {user ? (
                <>
                  <li>
                    <Link to="/dashboard" className={isActiveLink('/dashboard')}>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className={isActiveLink('/profile')}>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="logout-button">
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/login" className={isActiveLink('/login')}>
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
