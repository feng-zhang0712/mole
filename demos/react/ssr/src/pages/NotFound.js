import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | SSR React App</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div>
        <div>
          <div>
            <div>404</div>
            <h1>Page Not Found</h1>
            <p>
              Oops! The page you're looking for doesn't exist. It might have been moved, 
              deleted, or you entered the wrong URL.
            </p>
            <div>
              <Link to="/">
                Go Home
              </Link>
              <Link to="/products">
                Browse Products
              </Link>
            </div>
            <div>
              <h3>Helpful Links</h3>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/products">Products</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotFound;
