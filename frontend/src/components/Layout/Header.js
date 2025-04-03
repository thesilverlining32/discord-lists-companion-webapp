import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { logout } from '../../services/auth';
import './Header.css';
import { Menu, X } from 'lucide-react'; // Import icons

const Header = () => {
  const { user, setUser, loading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  const isActiveLink = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-main">
          <Link to="/" className="logo">
            Idea List
          </Link>

          {!loading && (
            <>
              <button className="mobile-menu-button" onClick={toggleMenu} aria-label="Toggle menu">
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <nav className={`nav-menu ${menuOpen ? 'open' : ''}`}>
                <ul className="nav-links">
                  <li>
                    <Link to="/" className={isActiveLink('/')} onClick={() => setMenuOpen(false)}>
                      Home
                    </Link>
                  </li>
                  {user ? (
                    <>
                      <li>
                        <Link to="/dashboard" className={isActiveLink('/dashboard')} onClick={() => setMenuOpen(false)}>
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link to="/profile" className={isActiveLink('/profile')} onClick={() => setMenuOpen(false)}>
                          Profile
                        </Link>
                      </li>
                      <li>
                        <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="logout-button">
                          Logout
                        </button>
                      </li>
                    </>
                  ) : (
                    <li>
                      <Link to="/login" className={isActiveLink('/login')} onClick={() => setMenuOpen(false)}>
                        Login
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
