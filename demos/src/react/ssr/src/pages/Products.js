import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext.js';
import './Products.css';

function Products() {
  const { products, loading, error, fetchProducts } = useData();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading && products.length === 0) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Helmet>
        <title>Products - SSR React App</title>
        <meta name="description" content="Browse our complete product catalog" />
        <meta property="og:title" content="Products - SSR React App" />
        <meta property="og:description" content="Browse our complete product catalog" />
      </Helmet>

      <div>
        <div>
          <header>
            <h1>Our Products</h1>
            <p>Discover our comprehensive collection of high-quality products</p>
          </header>

          {products.length > 0 ? (
            <div>
              <div>
                {products.map(product => (
                  <div key={product.id}>
                    <div>
                      <div>
                        {product.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <div>
                        <span>{product.category}</span>
                        <span>${product.price}</span>
                      </div>
                      <Link to={`/products/${product.id}`}>
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p>No products available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Products;
