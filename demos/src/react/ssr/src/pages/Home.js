import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext.js';
import './Home.css';

function Home() {
  const { products, loading, error, fetchProducts } = useData();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading && products.length === 0) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Helmet>
        <title>Home - SSR React App</title>
        <meta name="description" content="Welcome to our SSR React application" />
        <meta property="og:title" content="Home - SSR React App" />
        <meta property="og:description" content="Welcome to our SSR React application" />
      </Helmet>

      <div>
        <section>
          <div>
            <h1>Welcome to SSR React App</h1>
            <p>A complete server-side rendering React application that solves all major SSR challenges</p>
            <Link to="/products">Explore Products</Link>
          </div>
        </section>

        <section>
          <h2>Key Features</h2>
          <div>
            <div>
              <h3>Data Fetching</h3>
              <p>Efficient data fetching with server-side rendering and client-side hydration</p>
            </div>
            <div>
              <h3>Routing</h3>
              <p>Seamless routing between server and client with React Router</p>
            </div>
            <div>
              <h3>SEO Optimized</h3>
              <p>Dynamic meta tags and structured data for better search engine visibility</p>
            </div>
            <div>
              <h3>Performance</h3>
              <p>Optimized bundle splitting and caching strategies</p>
            </div>
          </div>
        </section>

        {products.length > 0 && (
          <section>
            <h2>Featured Products</h2>
            <div>
              {products.slice(0, 3).map(product => (
                <div key={product.id}>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <p>${product.price}</p>
                  <Link to={`/products/${product.id}`}>
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default Home;
