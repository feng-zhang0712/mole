import React, { useState, useEffect } from 'react';
import './ProductManagementApp.css';

const ProductManagementApp = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('name');

  // 模拟商品数据
  const mockProducts = [
    { id: 1, name: 'iPhone 15 Pro', category: 'electronics', price: 8999, stock: 50, description: '最新款iPhone，搭载A17 Pro芯片', image: '📱', rating: 4.8 },
    { id: 2, name: 'MacBook Air M2', category: 'electronics', price: 9999, stock: 30, description: '轻薄便携的MacBook，M2芯片性能强劲', image: '💻', rating: 4.9 },
    { id: 3, name: 'AirPods Pro', category: 'electronics', price: 1999, stock: 100, description: '主动降噪无线耳机', image: '🎧', rating: 4.7 },
    { id: 4, name: 'Nike Air Max', category: 'clothing', price: 899, stock: 80, description: '经典运动鞋，舒适透气', image: '👟', rating: 4.6 },
    { id: 5, name: 'Uniqlo 基础T恤', category: 'clothing', price: 99, stock: 200, description: '纯棉材质，多色可选', image: '👕', rating: 4.5 },
    { id: 6, name: '星巴克咖啡豆', category: 'food', price: 128, stock: 150, description: '精选阿拉比卡咖啡豆，醇香浓郁', image: '☕', rating: 4.4 },
    { id: 7, name: 'Kindle Paperwhite', category: 'books', price: 999, stock: 60, description: '电子书阅读器，护眼屏幕', image: '📚', rating: 4.6 },
    { id: 8, name: '乐高创意系列', category: 'toys', price: 299, stock: 120, description: '激发创造力的积木玩具', image: '🧱', rating: 4.8 }
  ];

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddProduct = (productData) => {
    const newProduct = {
      ...productData,
      id: products.length + 1,
      rating: 4.0
    };
    setProducts([...products, newProduct]);
    setShowAddForm(false);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts(products.map(product => product.id === updatedProduct.id ? updatedProduct : product));
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('确定要删除这个商品吗？')) {
      setProducts(products.filter(product => product.id !== productId));
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      case 'stock':
        return b.stock - a.stock;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  if (loading) {
    return (
      <div className="product-management-app">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="product-management-app">
      <div className="app-header">
        <h2>🛒 商品管理系统</h2>
        <p>管理商品信息、库存和购物车</p>
      </div>

      <div className="controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="搜索商品名称或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">所有分类</option>
            <option value="electronics">电子产品</option>
            <option value="clothing">服装</option>
            <option value="food">食品</option>
            <option value="books">图书</option>
            <option value="toys">玩具</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">按名称排序</option>
            <option value="price">按价格排序</option>
            <option value="rating">按评分排序</option>
            <option value="stock">按库存排序</option>
          </select>
        </div>
        <div className="view-controls">
          <button
            onClick={() => setViewMode('grid')}
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
          >
            📱 网格视图
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
          >
            📋 列表视图
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="add-product-btn"
          >
            ➕ 添加商品
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="stat-card">
          <h3>总商品数</h3>
          <p>{products.length}</p>
        </div>
        <div className="stat-card">
          <h3>购物车商品</h3>
          <p>{cart.length}</p>
        </div>
        <div className="stat-card">
          <h3>总价值</h3>
          <p>¥{getTotalPrice().toLocaleString()}</p>
        </div>
      </div>

      <div className="main-content">
        <div className="products-section">
          <h3>商品列表 ({sortedProducts.length})</h3>
          {viewMode === 'grid' ? (
            <div className="products-grid">
              {sortedProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">{product.image}</div>
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p className="product-description">{product.description}</p>
                    <div className="product-meta">
                      <span className="category-badge">{product.category}</span>
                      <span className="rating">⭐ {product.rating}</span>
                    </div>
                    <div className="product-price">¥{product.price.toLocaleString()}</div>
                    <div className="product-stock">库存: {product.stock}</div>
                    <div className="product-actions">
                      <button
                        onClick={() => addToCart(product)}
                        className="add-to-cart-btn"
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? '缺货' : '加入购物车'}
                      </button>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="edit-btn"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="delete-btn"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="products-list">
              <table>
                <thead>
                  <tr>
                    <th>商品</th>
                    <th>分类</th>
                    <th>价格</th>
                    <th>库存</th>
                    <th>评分</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div className="product-row">
                          <span className="product-icon">{product.image}</span>
                          <div>
                            <div className="product-name">{product.name}</div>
                            <div className="product-description">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{product.category}</span>
                      </td>
                      <td>¥{product.price.toLocaleString()}</td>
                      <td>{product.stock}</td>
                      <td>⭐ {product.rating}</td>
                      <td>
                        <div className="actions">
                          <button
                            onClick={() => addToCart(product)}
                            className="add-to-cart-btn"
                            disabled={product.stock === 0}
                          >
                            {product.stock === 0 ? '缺货' : '加入购物车'}
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="edit-btn"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="delete-btn"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="cart-section">
          <h3>🛒 购物车 ({cart.length})</h3>
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>购物车是空的</p>
              <p>添加一些商品吧！</p>
            </div>
          ) : (
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-image">{item.image}</span>
                    <div>
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">¥{item.price.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="cart-item-controls">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="remove-btn"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              <div className="cart-total">
                <strong>总计: ¥{getTotalPrice().toLocaleString()}</strong>
              </div>
              <button className="checkout-btn">结账</button>
            </div>
          )}
        </div>
      </div>

      {showAddForm && (
        <ProductForm
          onSubmit={handleAddProduct}
          onCancel={() => setShowAddForm(false)}
          mode="add"
        />
      )}

      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleUpdateProduct}
          onCancel={() => setEditingProduct(null)}
          mode="edit"
        />
      )}
    </div>
  );
};

// 商品表单组件
const ProductForm = ({ product, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'electronics',
    price: product?.price || '',
    stock: product?.stock || '',
    description: product?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'edit') {
      onSubmit({ ...product, ...formData });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{mode === 'edit' ? '编辑商品' : '添加商品'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>商品名称:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>分类:</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="electronics">电子产品</option>
              <option value="clothing">服装</option>
              <option value="food">食品</option>
              <option value="books">图书</option>
              <option value="toys">玩具</option>
            </select>
          </div>
          <div className="form-group">
            <label>价格:</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>库存:</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label>描述:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              rows="3"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {mode === 'edit' ? '更新' : '添加'}
            </button>
            <button type="button" onClick={onCancel} className="cancel-btn">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductManagementApp;
