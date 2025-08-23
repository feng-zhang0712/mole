import React from 'react';
import { Link } from 'react-router-dom';

function Products() {
  // 模拟产品数据
  const products = [
    { id: 1, name: '产品A', price: '¥99', description: '这是产品A的描述' },
    { id: 2, name: '产品B', price: '¥199', description: '这是产品B的描述' },
    { id: 3, name: '产品C', price: '¥299', description: '这是产品C的描述' },
    { id: 4, name: '产品D', price: '¥399', description: '这是产品D的描述' },
  ];

  return (
    <div className="page products-page">
      <h1>产品列表</h1>
      <p>点击产品查看详情，体验动态路由参数处理</p>
      
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p className="price">{product.price}</p>
            <p className="description">{product.description}</p>
            
            {/* 
              动态路由链接示例：
              1. 使用 Link 组件创建导航链接
              2. to 属性使用模板字符串动态生成路径
              3. 当点击链接时，会跳转到 /products/:id 路由
              4. ProductDetail 组件会接收到对应的 id 参数
            */}
            <Link 
              to={`/products/${product.id}`} 
              className="view-details-btn"
            >
              查看详情
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
