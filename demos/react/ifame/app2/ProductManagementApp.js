import React, { useState, useEffect, useCallback } from 'react';
import './ProductManagementApp.css';

const ProductManagementApp = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [communicationStatus, setCommunicationStatus] = useState('正在连接主应用...');
  const [globalStateInfo, setGlobalStateInfo] = useState('正在获取全局状态...');
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    totalValue: 0
  });

  // 模拟产品数据
  const mockProducts = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      category: '电子产品',
      price: 8999,
      stock: 50,
      status: 'instock',
      createdAt: '2024-01-01'
    },
    {
      id: 2,
      name: 'MacBook Air M2',
      category: '电子产品',
      price: 9999,
      stock: 25,
      status: 'instock',
      createdAt: '2024-01-02'
    },
    {
      id: 3,
      name: 'AirPods Pro',
      category: '配件',
      price: 1999,
      stock: 5,
      status: 'lowstock',
      createdAt: '2024-01-03'
    },
    {
      id: 4,
      name: 'iPad Air',
      category: '电子产品',
      price: 4799,
      stock: 0,
      status: 'outofstock',
      createdAt: '2024-01-04'
    },
    {
      id: 5,
      name: 'Apple Watch',
      category: '可穿戴设备',
      price: 2999,
      stock: 15,
      status: 'instock',
      createdAt: '2024-01-05'
    }
  ];

  // 初始化应用
  useEffect(() => {
    initializeApp();
  }, []);

  // 初始化应用
  const initializeApp = useCallback(async () => {
    try {
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 加载产品数据
      setProducts(mockProducts);
      updateStats(mockProducts);
      
      // 设置通信状态
      setupCommunication();
      
      // 获取全局状态
      getGlobalState();
      
      setLoading(false);
      
      console.log('产品管理应用初始化完成');
    } catch (error) {
      console.error('产品管理应用初始化失败:', error);
      setCommunicationStatus('连接失败: ' + error.message);
    }
  }, []);

  // 设置通信
  const setupCommunication = useCallback(() => {
    // 监听来自主应用的消息
    window.addEventListener('message', handleMessage);
    
    // 发送应用就绪消息
    sendMessageToParent('appReady', {
      appId: 'app2',
      timestamp: Date.now(),
      status: 'ready'
    });
    
    setCommunicationStatus('✅ 已连接到主应用');
    
    // 定期发送心跳
    setInterval(() => {
      sendMessageToParent('heartbeat', {
        appId: 'app2',
        timestamp: Date.now()
      });
    }, 30000);
  }, []);

  // 处理来自主应用的消息
  const handleMessage = useCallback((event) => {
    const { data: message } = event;
    
    console.log('收到主应用消息:', message);
    
    switch (message.type) {
      case 'stateChange':
        handleGlobalStateChange(message);
        break;
      case 'themeChange':
        handleThemeChange(message);
        break;
      case 'productAction':
        handleProductAction(message);
        break;
      default:
        console.log('未知消息类型:', message.type);
    }
  }, []);

  // 发送消息到主应用
  const sendMessageToParent = useCallback((type, data) => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type,
          data,
          source: 'app2',
          timestamp: Date.now()
        }, '*');
      }
    } catch (error) {
      console.warn('发送消息到主应用失败:', error);
    }
  }, []);

  // 处理全局状态变化
  const handleGlobalStateChange = useCallback((message) => {
    const { key, value } = message;
    
    if (key === 'userInfo') {
      setGlobalStateInfo(`当前用户: ${value?.name || '未知'} (${value?.role || '未知角色'})`);
    } else if (key === 'theme') {
      setGlobalStateInfo(`当前主题: ${value || '默认'}`);
    }
  }, []);

  // 处理主题变化
  const handleThemeChange = useCallback((message) => {
    const { theme } = message;
    document.body.className = theme || '';
    setGlobalStateInfo(`主题已切换为: ${theme || '默认'}`);
  }, []);

  // 处理产品操作
  const handleProductAction = useCallback((message) => {
    const { action, productId } = message;
    
    switch (action) {
      case 'refresh':
        refreshProducts();
        break;
      case 'selectProduct':
        selectProduct(productId);
        break;
      default:
        console.log('未知产品操作:', action);
    }
  }, []);

  // 获取全局状态
  const getGlobalState = useCallback(() => {
    try {
      if (window.parent && window.parent.mainApp) {
        const userInfo = window.parent.mainApp.getGlobalState('userInfo');
        const theme = window.parent.mainApp.getGlobalState('theme');
        
        if (userInfo) {
          setGlobalStateInfo(`当前用户: ${userInfo.name} (${userInfo.role})`);
        }
        
        if (theme) {
          document.body.className = theme;
        }
      }
    } catch (error) {
      console.warn('获取全局状态失败:', error);
      setGlobalStateInfo('无法获取全局状态');
    }
  }, []);

  // 更新统计信息
  const updateStats = useCallback((productList) => {
    const totalProducts = productList.length;
    const inStock = productList.filter(product => product.status === 'instock').length;
    const lowStock = productList.filter(product => product.status === 'lowstock').length;
    const totalValue = productList.reduce((sum, product) => sum + product.price * product.stock, 0);

    setStats({
      totalProducts,
      inStock,
      lowStock,
      totalValue
    });
  }, []);

  // 刷新产品数据
  const refreshProducts = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setProducts([...mockProducts]);
      updateStats(mockProducts);
      setLoading(false);
      
      // 通知主应用数据已刷新
      sendMessageToParent('dataRefreshed', {
        appId: 'app2',
        timestamp: Date.now(),
        count: mockProducts.length
      });
    }, 1000);
  }, []);

  // 选择产品
  const selectProduct = useCallback((productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  }, []);

  // 全选/取消全选
  const toggleSelectAll = useCallback(() => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(product => product.id));
    }
  }, [selectedProducts.length, products]);

  // 添加产品
  const addProduct = useCallback(() => {
    const newProduct = {
      id: products.length + 1,
      name: `产品${products.length + 1}`,
      category: '新分类',
      price: Math.floor(Math.random() * 1000) + 100,
      stock: Math.floor(Math.random() * 100) + 10,
      status: 'instock',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    updateStats(updatedProducts);
    
    // 通知主应用产品已添加
    sendMessageToParent('productAdded', {
      appId: 'app2',
      timestamp: Date.now(),
      product: newProduct
    });
  }, [products, updateStats]);

  // 删除选中产品
  const deleteSelectedProducts = useCallback(() => {
    if (selectedProducts.length === 0) return;
    
    const updatedProducts = products.filter(product => !selectedProducts.includes(product.id));
    setProducts(updatedProducts);
    setSelectedProducts([]);
    updateStats(updatedProducts);
    
    // 通知主应用产品已删除
    sendMessageToParent('productsDeleted', {
      appId: 'app2',
      timestamp: Date.now(),
      deletedCount: selectedProducts.length
    });
  }, [selectedProducts, products, updateStats]);

  // 导出数据
  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products-data.json';
    link.click();
    URL.revokeObjectURL(url);
    
    // 通知主应用数据已导出
    sendMessageToParent('dataExported', {
      appId: 'app2',
      timestamp: Date.now(),
      format: 'json'
    });
  }, [products]);

  // 获取状态样式类
  const getStatusClass = useCallback((status) => {
    switch (status) {
      case 'instock':
        return 'status-instock';
      case 'lowstock':
        return 'status-lowstock';
      case 'outofstock':
        return 'status-outofstock';
      default:
        return '';
    }
  }, []);

  // 获取状态文本
  const getStatusText = useCallback((status) => {
    switch (status) {
      case 'instock':
        return '有库存';
      case 'lowstock':
        return '库存不足';
      case 'outofstock':
        return '缺货';
      default:
        return '未知';
    }
  }, []);

  // 渲染产品行
  const renderProductRow = useCallback((product) => (
    <tr key={product.id}>
      <td>
        <input
          type="checkbox"
          checked={selectedProducts.includes(product.id)}
          onChange={() => selectProduct(product.id)}
        />
      </td>
      <td>{product.id}</td>
      <td>{product.name}</td>
      <td>{product.category}</td>
      <td className="price">¥{product.price}</td>
      <td className={product.stock < 10 ? 'stock-warning' : ''}>
        {product.stock}
      </td>
      <td>
        <span className={`status-badge ${getStatusClass(product.status)}`}>
          {getStatusText(product.status)}
        </span>
      </td>
      <td>{product.createdAt}</td>
      <td>
        <button className="btn btn-primary" style={{ marginRight: '0.5rem' }}>
          编辑
        </button>
        <button className="btn btn-danger">
          删除
        </button>
      </td>
    </tr>
  ), [selectedProducts, selectProduct, getStatusClass, getStatusText]);

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>正在加载产品管理应用...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">📦 产品管理系统</h1>
        <p className="app-description">产品信息管理、库存控制、价格管理</p>
      </div>
      
      <div className="communication-panel">
        <div className="communication-title">🔗 微前端通信状态</div>
        <div className="communication-content">
          {communicationStatus}
        </div>
      </div>
      
      <div className="global-state-panel">
        <div className="global-state-title">🌐 全局状态信息</div>
        <div className="global-state-content">
          {globalStateInfo}
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalProducts}</div>
          <div className="stat-label">总产品数</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.inStock}</div>
          <div className="stat-label">有库存</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.lowStock}</div>
          <div className="stat-label">库存不足</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">¥{stats.totalValue}</div>
          <div className="stat-label">总价值</div>
        </div>
      </div>
      
      <div className="main-content">
        <div className="content-header">
          <h2 className="content-title">产品列表</h2>
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={addProduct}>
              添加产品
            </button>
            <button className="btn btn-success">
              导入数据
            </button>
            <button className="btn btn-warning" onClick={refreshProducts}>
              刷新
            </button>
            <button className="btn btn-info" onClick={exportData}>
              导出数据
            </button>
          </div>
        </div>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>ID</th>
                <th>产品名称</th>
                <th>分类</th>
                <th>价格</th>
                <th>库存</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map(renderProductRow)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManagementApp;
