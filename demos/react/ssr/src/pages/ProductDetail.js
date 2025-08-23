import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useData } from '../context/DataContext.js';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProduct, loading, error, fetchProduct } = useData();

  useEffect(() => {
    fetchProduct(id);
  }, [fetchProduct, id]);

  if (loading && !currentProduct) {
    return <div>Loading product details...</div>;
  }

  if (error) {
    return (
      <div>
        <div>Error: {error}</div>
        <button onClick={() => navigate('/products')}>
          Back to Products
        </button>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div>
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <Link to="/products">Back to Products</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{currentProduct.name} - SSR React App</title>
        <meta name="description" content={currentProduct.description} />
        <meta property="og:title" content={currentProduct.name} />
        <meta property="og:description" content={currentProduct.description} />
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={currentProduct.price} />
        <meta property="product:price:currency" content="USD" />
      </Helmet>

      <div>
        <div>
          <nav>
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/products">Products</Link>
            <span>/</span>
            <span>{currentProduct.name}</span>
          </nav>

          <div>
            <div>
              <div>
                <div>
                  {currentProduct.name.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            <div>
              <h1>{currentProduct.name}</h1>
              <p>{currentProduct.description}</p>
              
              <div>
                <div>
                  <span>Category:</span>
                  <span>{currentProduct.category}</span>
                </div>
                <div>
                  <span>Price:</span>
                  <span>${currentProduct.price}</span>
                </div>
                <div>
                  <span>ID:</span>
                  <span>{currentProduct.id}</span>
                </div>
              </div>

              <div>
                <button>Add to Cart</button>
                <Link to="/products">
                  Back to Products
                </Link>
              </div>
            </div>
          </div>

          <div>
            <h2>Product Information</h2>
            <p>
              This is a detailed view of the product with complete information. 
              The page demonstrates how SSR handles dynamic routes and data fetching 
              for individual product pages.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetail;
