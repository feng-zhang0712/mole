// 模拟产品数据
const mockProducts = [
  {
    id: '1',
    name: 'React SSR Framework',
    description: 'A comprehensive server-side rendering framework for React applications with built-in optimizations and best practices.',
    category: 'Framework',
    price: 99.99
  },
  {
    id: '2',
    name: 'Webpack Optimization Suite',
    description: 'Advanced webpack configuration with code splitting, tree shaking, and performance optimizations.',
    category: 'Build Tools',
    price: 79.99
  },
  {
    id: '3',
    name: 'Express.js Middleware Pack',
    description: 'Collection of essential Express.js middleware for security, performance, and development.',
    category: 'Backend',
    price: 59.99
  },
  {
    id: '4',
    name: 'React Component Library',
    description: 'Professional React component library with TypeScript support and accessibility features.',
    category: 'UI Components',
    price: 129.99
  },
  {
    id: '5',
    name: 'Node.js Performance Monitor',
    description: 'Real-time monitoring and profiling tools for Node.js applications.',
    category: 'Monitoring',
    price: 89.99
  },
  {
    id: '6',
    name: 'CSS-in-JS Solution',
    description: 'Modern CSS-in-JS implementation with server-side rendering support and theme management.',
    category: 'Styling',
    price: 69.99
  }
];

// 模拟API延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 获取所有产品
export async function fetchProducts() {
  // 模拟网络延迟
  await delay(100);
  
  // 模拟随机错误（开发环境）
  if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
    throw new Error('Simulated network error');
  }
  
  return [...mockProducts];
}

// 根据ID获取单个产品
export async function fetchProduct(id) {
  // 模拟网络延迟
  await delay(150);
  
  // 模拟随机错误（开发环境）
  if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
    throw new Error('Simulated network error');
  }
  
  const product = mockProducts.find(p => p.id === id);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  return product;
}

// 搜索产品
export async function searchProducts(query) {
  await delay(200);
  
  if (!query || query.trim() === '') {
    return mockProducts;
  }
  
  const searchTerm = query.toLowerCase();
  return mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm)
  );
}

// 按类别筛选产品
export async function getProductsByCategory(category) {
  await delay(100);
  
  if (!category) {
    return mockProducts;
  }
  
  return mockProducts.filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  );
}
