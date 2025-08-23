# 虚拟列表实现方式详解

虚拟列表是一种优化长列表性能的技术，有多种实现方式。本文将介绍主要的实现方法及其关键代码。

## 1. 固定高度虚拟列表（Fixed Height Virtual List）

这是最基础也是最常用的实现方式，适用于所有列表项高度相同的情况。

### 核心实现代码

```javascript
class FixedHeightVirtualList {
  constructor(container, options = {}) {
    this.container = container;
    this.itemHeight = options.itemHeight || 50;
    this.visibleCount = options.visibleCount || 10;
    this.totalCount = options.totalCount || 0;
    this.data = options.data || [];
    this.scrollTop = 0;
    
    this.init();
  }

  render() {
    // 计算可见区域的起始和结束索引
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + this.visibleCount + 1,
      this.totalCount
    );

    // 清空并重新渲染可见项
    this.viewport.innerHTML = '';
    for (let i = startIndex; i < endIndex; i++) {
      const item = this.createListItem(i, this.data[i]);
      item.style.transform = `translateY(${i * this.itemHeight}px)`;
      this.viewport.appendChild(item);
    }
  }
}
```

## 2. 动态高度虚拟列表（Dynamic Height Virtual List）

适用于列表项高度不固定的情况，需要缓存每个项的高度。

### 核心实现代码

```javascript
class DynamicHeightVirtualList {
  constructor(container, options = {}) {
    this.container = container;
    this.estimatedItemHeight = options.estimatedItemHeight || 50;
    this.visibleCount = options.visibleCount || 10;
    this.totalCount = options.totalCount || 0;
    this.data = options.data || [];
    this.itemHeights = new Map(); // 缓存每个项的高度
    this.itemPositions = []; // 缓存每个项的位置
    
    this.init();
  }

  // 计算每个项的位置
  calculatePositions() {
    this.itemPositions = [0];
    for (let i = 0; i < this.totalCount; i++) {
      const height = this.itemHeights.get(i) || this.estimatedItemHeight;
      this.itemPositions[i + 1] = this.itemPositions[i] + height;
    }
  }

  // 二分查找可见区域的起始索引
  findStartIndex(scrollTop) {
    let left = 0;
    let right = this.totalCount - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (this.itemPositions[mid] <= scrollTop && 
          this.itemPositions[mid + 1] > scrollTop) {
        return mid;
      }
      if (this.itemPositions[mid] > scrollTop) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    return left;
  }

  render() {
    const startIndex = this.findStartIndex(this.scrollTop);
    const endIndex = Math.min(
      startIndex + this.visibleCount + 2,
      this.totalCount
    );

    this.viewport.innerHTML = '';
    for (let i = startIndex; i < endIndex; i++) {
      const item = this.createListItem(i, this.data[i]);
      item.style.transform = `translateY(${this.itemPositions[i]}px)`;
      this.viewport.appendChild(item);
    }
  }
}
```

## 3. 窗口化虚拟列表（Windowing Virtual List）

使用 `react-window` 或类似库的实现方式，更高效地管理可见区域。

### 核心实现代码

```javascript
class WindowingVirtualList {
  constructor(container, options = {}) {
    this.container = container;
    this.itemHeight = options.itemHeight || 50;
    this.visibleCount = options.visibleCount || 10;
    this.totalCount = options.totalCount || 0;
    this.data = options.data || [];
    this.scrollTop = 0;
    this.overscan = options.overscan || 5; // 预渲染的数量
    
    this.init();
  }

  render() {
    const startIndex = Math.max(0, 
      Math.floor(this.scrollTop / this.itemHeight) - this.overscan
    );
    const endIndex = Math.min(
      this.totalCount,
      Math.ceil((this.scrollTop + this.container.clientHeight) / this.itemHeight) + this.overscan
    );

    // 使用 DocumentFragment 优化批量DOM操作
    const fragment = document.createDocumentFragment();
    for (let i = startIndex; i < endIndex; i++) {
      const item = this.createListItem(i, this.data[i]);
      item.style.transform = `translateY(${i * this.itemHeight}px)`;
      fragment.appendChild(item);
    }

    this.viewport.innerHTML = '';
    this.viewport.appendChild(fragment);
  }
}
```

## 4. 基于 Intersection Observer 的虚拟列表

使用现代浏览器API实现，性能更好，代码更简洁。

### 核心实现代码

```javascript
class IntersectionObserverVirtualList {
  constructor(container, options = {}) {
    this.container = container;
    this.itemHeight = options.itemHeight || 50;
    this.visibleCount = options.visibleCount || 10;
    this.totalCount = options.totalCount || 0;
    this.data = options.data || [];
    this.observer = null;
    
    this.init();
  }

  init() {
    this.createContainer();
    this.setupIntersectionObserver();
    this.render();
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            this.onItemVisible(index);
          }
        });
      },
      {
        root: this.container,
        rootMargin: '50px', // 预加载区域
        threshold: 0.1
      }
    );
  }

  render() {
    this.viewport.innerHTML = '';
    
    // 渲染所有项，但只观察可见的
    for (let i = 0; i < this.totalCount; i++) {
      const item = this.createListItem(i, this.data[i]);
      item.dataset.index = i;
      item.style.transform = `translateY(${i * this.itemHeight}px)`;
      this.viewport.appendChild(item);
      
      // 观察每个项
      this.observer.observe(item);
    }
  }

  onItemVisible(index) {
    // 处理项变为可见的逻辑
    console.log(`Item ${index} is now visible`);
  }
}
```

## 5. 基于 ResizeObserver 的自适应虚拟列表

能够自动适应列表项高度变化的虚拟列表。

### 核心实现代码

```javascript
class AdaptiveVirtualList {
  constructor(container, options = {}) {
    this.container = container;
    this.estimatedItemHeight = options.estimatedItemHeight || 50;
    this.visibleCount = options.visibleCount || 10;
    this.totalCount = options.totalCount || 0;
    this.data = options.data || [];
    this.itemHeights = new Map();
    this.resizeObserver = null;
    
    this.init();
  }

  init() {
    this.createContainer();
    this.setupResizeObserver();
    this.render();
  }

  setupResizeObserver() {
    this.resizeObserver = new ResizeObserver((entries) => {
      let needsUpdate = false;
      
      entries.forEach(entry => {
        const index = parseInt(entry.target.dataset.index);
        const newHeight = entry.contentRect.height;
        
        if (this.itemHeights.get(index) !== newHeight) {
          this.itemHeights.set(index, newHeight);
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        this.updateLayout();
      }
    });
  }

  updateLayout() {
    // 重新计算所有项的位置
    this.calculatePositions();
    // 重新渲染可见区域
    this.render();
  }

  render() {
    const startIndex = this.findStartIndex(this.scrollTop);
    const endIndex = Math.min(
      startIndex + this.visibleCount + 2,
      this.totalCount
    );

    this.viewport.innerHTML = '';
    for (let i = startIndex; i < endIndex; i++) {
      const item = this.createListItem(i, this.data[i]);
      item.dataset.index = i;
      item.style.transform = `translateY(${this.itemPositions[i]}px)`;
      this.viewport.appendChild(item);
      
      // 观察尺寸变化
      this.resizeObserver.observe(item);
    }
  }
}
```

## 6. 基于 Web Workers 的虚拟列表

将计算密集型操作放在后台线程中，避免阻塞主线程。

### 核心实现代码

```javascript
class WorkerBasedVirtualList {
  constructor(container, options = {}) {
    this.container = container;
    this.itemHeight = options.itemHeight || 50;
    this.visibleCount = options.visibleCount || 10;
    this.totalCount = options.totalCount || 0;
    this.data = options.data || [];
    this.worker = null;
    
    this.init();
  }

  init() {
    this.createContainer();
    this.setupWorker();
    this.render();
  }

  setupWorker() {
    // 创建 Web Worker 处理计算
    this.worker = new Worker(URL.createObjectURL(new Blob([`
      self.onmessage = function(e) {
        const { scrollTop, itemHeight, totalCount, visibleCount } = e.data;
        
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
          startIndex + visibleCount + 1,
          totalCount
        );
        
        self.postMessage({ startIndex, endIndex });
      };
    `]));

    this.worker.onmessage = (e) => {
      const { startIndex, endIndex } = e.data;
      this.renderVisibleItems(startIndex, endIndex);
    };
  }

  render() {
    // 发送计算请求到 Worker
    this.worker.postMessage({
      scrollTop: this.scrollTop,
      itemHeight: this.itemHeight,
      totalCount: this.totalCount,
      visibleCount: this.visibleCount
    });
  }

  renderVisibleItems(startIndex, endIndex) {
    this.viewport.innerHTML = '';
    for (let i = startIndex; i < endIndex; i++) {
      const item = this.createListItem(i, this.data[i]);
      item.style.transform = `translateY(${i * this.itemHeight}px)`;
      this.viewport.appendChild(item);
    }
  }
}
```

## createListItem 方法实现详解

`createListItem` 方法是虚拟列表的核心方法，负责创建和配置单个列表项的DOM元素。不同的实现方式会有不同的实现策略。

### 基础实现

```javascript
createListItem(index, data) {
  const item = document.createElement('div');
  
  // 基础样式设置
  item.style.cssText = `
    height: ${this.itemHeight}px;
    line-height: ${this.itemHeight}px;
    padding: 0 20px;
    border-bottom: 1px solid #eee;
    background: ${index % 2 === 0 ? '#f9f9f9' : '#fff'};
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    box-sizing: border-box;
    overflow: hidden;
  `;
  
  // 设置内容
  item.textContent = `Item ${index + 1}: ${data || 'No data'}`;
  
  // 添加数据属性，便于后续操作
  item.dataset.index = index;
  item.dataset.data = JSON.stringify(data);
  
  return item;
}
```

### 高级实现（支持自定义渲染）

```javascript
createListItem(index, data, options = {}) {
  const {
    itemHeight = this.itemHeight,
    customClass = '',
    renderContent = null,
    itemStyle = {},
    itemClass = ''
  } = options;

  const item = document.createElement('div');
  
  // 基础样式
  const baseStyle = {
    height: `${itemHeight}px`,
    lineHeight: `${itemHeight}px`,
    padding: '0 20px',
    borderBottom: '1px solid #eee',
    background: index % 2 === 0 ? '#f9f9f9' : '#fff',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'background-color 0.2s ease'
  };

  // 合并自定义样式
  const finalStyle = { ...baseStyle, ...itemStyle };
  
  // 应用样式
  Object.assign(item.style, finalStyle);
  
  // 添加CSS类
  if (itemClass) {
    item.className = itemClass;
  }
  
  // 添加自定义类
  if (customClass) {
    item.classList.add(customClass);
  }
  
  // 设置数据属性
  item.dataset.index = index;
  item.dataset.data = JSON.stringify(data);
  
  // 自定义内容渲染
  if (renderContent && typeof renderContent === 'function') {
    item.innerHTML = renderContent(index, data, item);
  } else {
    // 默认内容渲染
    this.renderDefaultContent(item, index, data);
  }
  
  // 添加事件监听器
  this.addItemEventListeners(item, index, data);
  
  return item;
}

// 默认内容渲染
renderDefaultContent(item, index, data) {
  const content = document.createElement('div');
  content.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  `;
  
  // 左侧内容
  const leftContent = document.createElement('span');
  leftContent.textContent = `Item ${index + 1}`;
  leftContent.style.fontWeight = 'bold';
  
  // 右侧内容
  const rightContent = document.createElement('span');
  rightContent.textContent = data || 'No data';
  rightContent.style.color = '#666';
  
  content.appendChild(leftContent);
  content.appendChild(rightContent);
  item.appendChild(content);
}

// 添加事件监听器
addItemEventListeners(item, index, data) {
  // 点击事件
  item.addEventListener('click', (e) => {
    this.onItemClick(index, data, e);
  });
  
  // 鼠标悬停事件
  item.addEventListener('mouseenter', (e) => {
    item.style.backgroundColor = '#e3f2fd';
  });
  
  item.addEventListener('mouseleave', (e) => {
    item.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : '#fff';
  });
  
  // 双击事件
  item.addEventListener('dblclick', (e) => {
    this.onItemDoubleClick(index, data, e);
  });
}
```

### 支持复杂内容的实现

```javascript
createListItem(index, data, options = {}) {
  const {
    itemHeight = this.itemHeight,
    itemType = 'default',
    showCheckbox = false,
    showActions = false,
    selectable = true
  } = options;

  const item = document.createElement('div');
  
  // 基础样式
  item.style.cssText = `
    height: ${itemHeight}px;
    padding: 0 20px;
    border-bottom: 1px solid #eee;
    background: ${index % 2 === 0 ? '#f9f9f9' : '#fff'};
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    box-sizing: border-box;
  `;
  
  // 设置数据属性
  item.dataset.index = index;
  item.dataset.data = JSON.stringify(data);
  
  // 根据类型渲染不同内容
  switch (itemType) {
    case 'user':
      this.renderUserItem(item, index, data, options);
      break;
    case 'product':
      this.renderProductItem(item, index, data, options);
      break;
    case 'message':
      this.renderMessageItem(item, index, data, options);
      break;
    default:
      this.renderDefaultItem(item, index, data, options);
  }
  
  return item;
}

// 渲染用户项
renderUserItem(item, index, data, options) {
  // 复选框
  if (options.showCheckbox) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = data.selected || false;
    checkbox.addEventListener('change', (e) => {
      this.onItemSelect(index, e.target.checked);
    });
    item.appendChild(checkbox);
  }
  
  // 头像
  const avatar = document.createElement('img');
  avatar.src = data.avatar || 'default-avatar.png';
  avatar.style.cssText = `
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  `;
  item.appendChild(avatar);
  
  // 用户信息
  const userInfo = document.createElement('div');
  userInfo.style.cssText = `
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  `;
  
  const userName = document.createElement('div');
  userName.textContent = data.name || 'Unknown User';
  userName.style.fontWeight = 'bold';
  
  const userEmail = document.createElement('div');
  userEmail.textContent = data.email || 'No email';
  userEmail.style.fontSize = '12px';
  userEmail.style.color = '#666';
  
  userInfo.appendChild(userName);
  userInfo.appendChild(userEmail);
  item.appendChild(userInfo);
  
  // 操作按钮
  if (options.showActions) {
    const actions = document.createElement('div');
    actions.style.cssText = `
      display: flex;
      gap: 8px;
    `;
    
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.style.cssText = `
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 12px;
    `;
    editBtn.addEventListener('click', () => {
      this.onItemEdit(index, data);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.cssText = `
      padding: 4px 8px;
      border: 1px solid #ff4444;
      border-radius: 4px;
      background: white;
      color: #ff4444;
      cursor: pointer;
      font-size: 12px;
    `;
    deleteBtn.addEventListener('click', () => {
      this.onItemDelete(index, data);
    });
    
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    item.appendChild(actions);
  }
}

// 渲染产品项
renderProductItem(item, index, data, options) {
  // 产品图片
  const image = document.createElement('img');
  image.src = data.image || 'default-product.png';
  image.style.cssText = `
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 4px;
  `;
  item.appendChild(image);
  
  // 产品信息
  const productInfo = document.createElement('div');
  productInfo.style.cssText = `
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  `;
  
  const productName = document.createElement('div');
  productName.textContent = data.name || 'Unknown Product';
  productName.style.fontWeight = 'bold';
  
  const productPrice = document.createElement('div');
  productPrice.textContent = `$${data.price || '0.00'}`;
  productPrice.style.color = '#e44d26';
  productPrice.style.fontWeight = 'bold';
  
  const productDesc = document.createElement('div');
  productDesc.textContent = data.description || 'No description';
  productDesc.style.fontSize = '12px';
  productDesc.style.color = '#666';
  
  productInfo.appendChild(productName);
  productInfo.appendChild(productPrice);
  productInfo.appendChild(productDesc);
  item.appendChild(productInfo);
  
  // 库存状态
  const stockStatus = document.createElement('div');
  stockStatus.textContent = data.inStock ? 'In Stock' : 'Out of Stock';
  stockStatus.style.cssText = `
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
    background: ${data.inStock ? '#e8f5e8' : '#ffe8e8'};
    color: ${data.inStock ? '#2e7d32' : '#c62828'};
  `;
  item.appendChild(stockStatus);
}
```

### 性能优化版本

```javascript
createListItem(index, data, options = {}) {
  // 使用对象池复用DOM元素
  let item = this.itemPool.pop();
  
  if (!item) {
    item = document.createElement('div');
    this.setupItemElement(item);
  } else {
    // 重置元素状态
    this.resetItemElement(item);
  }
  
  // 更新元素内容
  this.updateItemContent(item, index, data, options);
  
  return item;
}

// 设置元素基础属性
setupItemElement(item) {
  // 只设置一次，避免重复操作
  item.style.cssText = `
    height: ${this.itemHeight}px;
    padding: 0 20px;
    border-bottom: 1px solid #eee;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    box-sizing: border-box;
    will-change: transform;
  `;
  
  // 使用事件委托，避免为每个元素绑定事件
  item.addEventListener('click', this.handleItemClick.bind(this));
}

// 重置元素状态
resetItemElement(item) {
  item.innerHTML = '';
  item.className = '';
  item.dataset.index = '';
  item.dataset.data = '';
}

// 更新元素内容
updateItemContent(item, index, data, options) {
  item.dataset.index = index;
  item.dataset.data = JSON.stringify(data);
  
  // 根据数据类型选择渲染策略
  const renderer = this.renderers.get(options.itemType) || this.renderers.get('default');
  renderer(item, index, data, options);
}

// 事件委托处理
handleItemClick(e) {
  const item = e.currentTarget;
  const index = parseInt(item.dataset.index);
  const data = JSON.parse(item.dataset.data);
  
  this.onItemClick(index, data, e);
}
```

### 使用示例

```javascript
// 基础使用
const virtualList = new VirtualList(container, {
  itemHeight: 60,
  visibleCount: 10,
  totalCount: 1000,
  data: userData
});

// 高级使用
const virtualList = new VirtualList(container, {
  itemHeight: 80,
  visibleCount: 8,
  totalCount: 5000,
  data: productData,
  createListItem: (index, data, options) => {
    return this.createListItem(index, data, {
      itemType: 'product',
      showActions: true,
      showCheckbox: true
    });
  }
});
```

`createListItem` 方法的实现需要考虑性能、可维护性和扩展性。基础版本适合简单场景，高级版本适合复杂业务需求，性能优化版本适合对性能要求极高的场景。