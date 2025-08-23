/**
 * 数据生成脚本
 * 用于生成大量测试数据来测试虚拟列表性能
 */

const fs = require('fs');
const path = require('path');

// 生成大量用户数据
function generateUsers(count) {
  const users = [];
  const names = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Edward', 'Fiona'];
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const roles = ['Admin', 'User', 'Moderator', 'Editor', 'Viewer'];
  const statuses = ['active', 'inactive', 'pending', 'suspended'];

  for (let i = 1; i <= count; i++) {
    const name = names[i % names.length];
    const domain = domains[i % domains.length];
    const role = roles[i % roles.length];
    const status = statuses[i % statuses.length];
    
    users.push({
      id: i,
      name: `${name} ${i}`,
      email: `${name.toLowerCase()}${i}@${domain}`,
      avatar: `https://via.placeholder.com/40x40/${getRandomColor()}/FFFFFF?text=${name.charAt(0)}`,
      role: role,
      status: status,
      lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      posts: Math.floor(Math.random() * 1000),
      followers: Math.floor(Math.random() * 10000)
    });
  }
  
  return users;
}

// 生成大量产品数据
function generateProducts(count) {
  const products = [];
  const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys', 'Automotive'];
  const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Canon', 'Nikon'];
  
  for (let i = 1; i <= count; i++) {
    const category = categories[i % categories.length];
    const brand = brands[i % brands.length];
    const basePrice = 10 + Math.random() * 2000;
    
    products.push({
      id: i,
      name: `${brand} ${category} Item ${i}`,
      price: parseFloat(basePrice.toFixed(2)),
      image: `https://via.placeholder.com/60x60/${getRandomColor()}/FFFFFF?text=${category.charAt(0)}`,
      description: `High-quality ${category.toLowerCase()} product from ${brand}. This is item number ${i} in our collection.`,
      category: category,
      brand: brand,
      inStock: Math.random() > 0.3,
      rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      reviews: Math.floor(Math.random() * 500),
      weight: parseFloat((0.1 + Math.random() * 5).toFixed(2)),
      dimensions: `${Math.floor(10 + Math.random() * 50)}x${Math.floor(10 + Math.random() * 50)}x${Math.floor(5 + Math.random() * 20)}cm`
    });
  }
  
  return products;
}

// 生成大量消息数据
function generateMessages(count) {
  const messages = [];
  const senders = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Helen'];
  const types = ['text', 'image', 'file', 'video', 'audio'];
  const contents = [
    'Hello! How are you doing today?',
    'The meeting is scheduled for tomorrow at 10 AM.',
    'Please review the attached document.',
    'Great work on the project!',
    'Can you help me with this issue?',
    'The deadline has been extended to next week.',
    'Thanks for your quick response.',
    'I have a question about the requirements.',
    'The presentation went really well.',
    'Let\'s discuss this in our next call.'
  ];
  
  for (let i = 1; i <= count; i++) {
    const sender = senders[i % senders.length];
    const type = types[i % types.length];
    const content = contents[i % contents.length];
    
    messages.push({
      id: i,
      sender: `${sender} ${i}`,
      content: `${content} (Message ${i})`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      avatar: `https://via.placeholder.com/32x32/${getRandomColor()}/FFFFFF?text=${sender.charAt(0)}`,
      unread: Math.random() > 0.7,
      type: type,
      attachments: type !== 'text' ? Math.floor(Math.random() * 3) : 0,
      priority: Math.random() > 0.8 ? 'high' : 'normal',
      threadId: Math.floor(i / 10) + 1
    });
  }
  
  return messages;
}

// 生成随机颜色
function getRandomColor() {
  const colors = ['4CAF50', '2196F3', 'FF9800', '9C27B0', '607D8B', 'E91E63', '795548', '3F51B5'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 生成大量数据
function generateLargeDataset() {
  const largeData = {
    users: generateUsers(10000),
    products: generateProducts(10000),
    messages: generateMessages(10000)
  };
  
  return largeData;
}

// 生成中等数据
function generateMediumDataset() {
  const mediumData = {
    users: generateUsers(1000),
    products: generateProducts(1000),
    messages: generateMessages(1000)
  };
  
  return mediumData;
}

// 生成小数据
function generateSmallDataset() {
  const smallData = {
    users: generateUsers(100),
    products: generateProducts(100),
    messages: generateMessages(100)
  };
  
  return smallData;
}

// 主函数
function main() {
  console.log('开始生成测试数据...');
  
  // 生成不同规模的数据集
  const datasets = {
    small: generateSmallDataset(),
    medium: generateMediumDataset(),
    large: generateLargeDataset()
  };
  
  // 保存到文件
  Object.entries(datasets).forEach(([size, data]) => {
    const filename = `mock-data-${size}.json`;
    const filepath = path.join(__dirname, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`已生成 ${filename}: ${Object.values(data).reduce((sum, arr) => sum + arr.length, 0)} 项数据`);
  });
  
  console.log('数据生成完成！');
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  generateUsers,
  generateProducts,
  generateMessages,
  generateSmallDataset,
  generateMediumDataset,
  generateLargeDataset
};
