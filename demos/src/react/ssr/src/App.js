import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import Home from './pages/Home.js';
import About from './pages/About.js';
import Products from './pages/Products.js';
import ProductDetail from './pages/ProductDetail.js';
import NotFound from './pages/NotFound.js';
import { DataProvider } from './context/DataContext.js';
import './App.css';

function App() {
  return (
    <DataProvider>
      <Router>
        <div>
          <Header />
          
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </DataProvider>
  );
}

export default App;
