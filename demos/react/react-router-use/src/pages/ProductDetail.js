import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ProductDetail() {
  // 获取动态路由参数
  const { id } = useParams();
  
  // 获取导航函数，用于编程式导航
  const navigate = useNavigate();
  
  // 模拟产品数据
  const products = {
    1: { name: '产品A', price: '¥99', description: '这是产品A的详细描述', category: '电子产品' },
    2: { name: '产品B', price: '¥199', description: '这是产品B的详细描述', category: '家居用品' },
    3: { name: '产品C', price: '¥299', description: '这是产品C的详细描述', category: '服装配饰' },
    4: { name: '产品D', price: '¥399', description: '这是产品D的详细描述', category: '运动户外' },
  };
  
  const product = products[id];
  
  // 处理产品不存在的情况
  if (!product) {
    return (
      <div className="page product-detail-page">
        <div className="error-message">
          <h1>产品不存在</h1>
          <p>ID为 {id} 的产品不存在</p>
          <button onClick={() => navigate('/products')} className="back-btn">
            返回产品列表
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page product-detail-page">
      <h1>产品详情</h1>
      
      {/* 
        动态路由参数使用说明：
        1. useParams() hook 用于获取URL中的动态参数
        2. 参数名称与路由定义中的 :id 对应
        3. 可以根据参数值动态渲染不同的内容
      */}
      <div className="product-detail">
        <h2>{product.name}</h2>
        <div className="product-info">
          <p><strong>产品ID:</strong> {id}</p>
          <p><strong>价格:</strong> {product.price}</p>
          <p><strong>分类:</strong> {product.category}</p>
          <p><strong>描述:</strong> {product.description}</p>
        </div>
      </div>
      
      <div className="navigation-options">
        <h3>导航选项：</h3>
        
        {/* 方式1：使用 Link 组件进行声明式导航 */}
        <Link to="/products" className="nav-btn">
          返回产品列表 (Link)
        </Link>
        
        {/* 方式2：使用编程式导航 */}
        <button 
          onClick={() => navigate('/products')} 
          className="nav-btn"
        >
          返回产品列表 (编程式导航)
        </button>
        
        {/* 方式3：使用 navigate 进行相对导航 */}
        <button 
          onClick={() => navigate(-1)} 
          className="nav-btn"
        >
          返回上一页 (navigate(-1))
        </button>
        
        {/* 方式4：带状态的导航 */}
        <button 
          onClick={() => navigate('/home', { 
            state: { from: 'product-detail', productId: id } 
          })} 
          className="nav-btn"
        >
          返回首页 (带状态)
        </button>
      </div>
    </div>
  );
}

export default ProductDetail;
