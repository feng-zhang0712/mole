import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header>
      <div>
        <div>
          <div>
            <Link to="/">SSR React App</Link>
          </div>
          
          <nav>
            <ul>
              <li>
                <Link 
                  to="/" 
                  className={`nav-link ${isActive('/') ? 'active' : ''}`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={`nav-link ${isActive('/about') ? 'active' : ''}`}
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className={`nav-link ${isActive('/products') ? 'active' : ''}`}
                >
                  Products
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
