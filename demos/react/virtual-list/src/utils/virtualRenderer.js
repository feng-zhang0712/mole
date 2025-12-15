// 高性能虚拟渲染器
class VirtualRenderer {
  constructor(options = {}) {
    this.content = options.content;
    this.itemHeight = options.itemHeight;
    this.visibleCount = options.visibleCount;
    this.bufferSize = options.bufferSize;
    this.totalCount = options.totalCount;
    
    this.pool = []; // DOM节点池
    this.activeItems = new Map(); // 当前激活的项
    this.lastRenderRange = { start: 0, end: 0 };
    this.renderQueue = [];
    this.isRendering = false; 
  }

  // 获取DOM节点（从池中复用或创建新节点）
  getItemElement() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return document.createElement('div');
  }

  // 回收DOM节点到池中
  recycleElement(element) {
    if (this.pool.length < 50) { // 限制池大小
      element.style.display = 'none';
      this.pool.push(element);
    }
  }

  // 计算可见范围
  calculateVisibleRange(scrollTop) {
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + this.visibleCount + this.bufferSize * 2,
      this.totalCount
    );
    
    return {
      start: Math.max(0, startIndex - this.bufferSize),
      end: endIndex
    };
  }

  // 批量渲染
  async renderRange(range, dataProvider, renderItem) {
    if (this.isRendering) {
      this.renderQueue.push({ range, dataProvider, renderItem });
      return;
    }

    this.isRendering = true;
    
    try {
      // 计算需要新增和移除的项
      const newItems = new Set();
      const oldItems = new Set(this.activeItems.keys());
      
      for (let i = range.start; i < range.end; i++) {
        newItems.add(i);
      }

      // 移除不再需要的项
      for (const index of oldItems) {
        if (!newItems.has(index)) {
          const element = this.activeItems.get(index);
          this.recycleElement(element);
          this.activeItems.delete(index);
        }
      }

      // 批量获取数据
      const dataPromises = [];
      for (let i = range.start; i < range.end; i++) {
        if (!this.activeItems.has(i)) {
          dataPromises.push(
            dataProvider(i).then(data => ({ index: i, data }))
          );
        }
      }

      const results = await Promise.all(dataPromises);

      // 批量更新DOM
      const fragment = document.createDocumentFragment();
      
      for (const { index, data } of results) {
        const element = this.getItemElement();
        element.style.position = 'absolute';
        element.style.top = `${index * this.itemHeight}px`;
        element.style.height = `${this.itemHeight}px`;
        element.style.width = '100%';
        element.style.display = 'block';
        
        // 渲染内容
        renderItem(element, data, index);
        console.log(data);
        
        
        this.activeItems.set(index, element);
        fragment.appendChild(element);
      }

      console.log([...fragment.children].map(item => item.style.top));

      this.content.appendChild(fragment);
      this.lastRenderRange = range;
      
    } finally {
      this.isRendering = false;
      
      // 处理队列中的下一个渲染任务
      if (this.renderQueue.length > 0) {
        const nextTask = this.renderQueue.shift();
        this.renderRange(nextTask.range, nextTask.dataProvider, nextTask.renderItem);
      }
    }
  }

  // 更新滚动位置
  updateScroll(scrollTop) {
    const newRange = this.calculateVisibleRange(scrollTop);

    // 检查是否需要重新渲染
    if (this.shouldReRender(newRange)) {
      this.renderRange(newRange, this.dataProvider, this.renderItem);
    }
  }

  // 判断是否需要重新渲染
  shouldReRender(newRange) {
    const { start: oldStart, end: oldEnd } = this.lastRenderRange;
    const { start: newStart, end: newEnd } = newRange;

    // console.log('shouldReRender ', oldStart, oldEnd, newStart, newEnd);
    
    // 如果新范围完全包含在旧范围内，不需要重新渲染
    if (newStart >= oldStart && newEnd <= oldEnd) {
      return false;
    }
    
    // 如果重叠部分小于50%，重新渲染
    const overlapStart = Math.max(oldStart, newStart);
    const overlapEnd = Math.min(oldEnd, newEnd);
    const overlap = Math.max(0, overlapEnd - overlapStart);
    const newRangeSize = newEnd - newStart;
    
    return overlap / newRangeSize < 0.5;
  }

  // 设置数据提供者和渲染函数
  setDataProvider(dataProvider) {
    this.dataProvider = dataProvider;
  }

  setRenderItem(renderItem) {
    this.renderItem = renderItem;
  }

  // 清理资源
  destroy() {
    this.activeItems.clear();
    this.pool.length = 0;
    this.renderQueue.length = 0;
    if (this.content && this.content.parentNode) {
      this.content.parentNode.removeChild(this.content);
    }
  }
}

// 渲染优化器
class RenderOptimizer {
  constructor() {
    this.observers = new Map();
    this.intersectionObserver = null;
    this.resizeObserver = null;
  }

  // 设置Intersection Observer
  setupIntersectionObserver(callback) {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const index = parseInt(entry.target.dataset.index);
          callback(index, entry.isIntersecting);
        });
      },
      {
        rootMargin: '50px',
        threshold: 0
      }
    );
  }

  // 设置Resize Observer
  setupResizeObserver(callback) {
    this.resizeObserver = new ResizeObserver(
      (entries) => {
        entries.forEach(entry => {
          callback(entry.target, entry.contentRect);
        });
      }
    );
  }

  // 观察元素
  observe(element, index) {
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(element);
    }
    if (this.resizeObserver) {
      this.resizeObserver.observe(element);
    }
    this.observers.set(element, index);
  }

  // 停止观察
  unobserve(element) {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
    }
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(element);
    }
    this.observers.delete(element);
  }

  // 清理
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.observers.clear();
  }
}

export { VirtualRenderer, RenderOptimizer };
