import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Resources</h3>
            <ul className="footer-links">
              <li>
                <Link to="/help">Help</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy</Link>
              </li>
              <li>
                <Link to="/terms">Terms</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Connect</h3>
            <ul className="footer-links">
              <li>
                <a href="https://discord.gg/your-server" target="_blank" rel="noopener noreferrer">
                  Discord
                </a>
              </li>
              <li>
                <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="copyright">
          © {currentYear} Idea List App. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
