// JavaScript 垃圾回收机制演示

// 1. 基本的内存分配和释放
console.log('=== 基本内存管理演示 ===');

function createObjects() {
  const obj1 = { name: 'Object 1', data: new Array(1000).fill('data') };
  const obj2 = { name: 'Object 2', data: new Array(1000).fill('data') };
  
  console.log('创建了两个对象');
  console.log('obj1:', obj1.name);
  console.log('obj2:', obj2.name);
  
  // obj1 和 obj2 在函数结束时会被垃圾回收
  return obj2; // 只返回 obj2，obj1 将被回收
}

const returnedObj = createObjects();
console.log('函数执行完毕，obj1 已被回收，obj2 仍然存在:', returnedObj.name);

// 2. 循环引用演示
console.log('\n=== 循环引用演示 ===');

function createCircularReference() {
  const parent = { name: 'Parent' };
  const child = { name: 'Child' };
  
  parent.child = child;
  child.parent = parent;
  
  console.log('创建了循环引用');
  console.log('parent.child.name:', parent.child.name);
  console.log('child.parent.name:', child.parent.name);
  
  // 即使有循环引用，标记-清除算法也能处理
  return { parent, child };
}

const circularRefs = createCircularReference();
console.log('循环引用对象仍然存在');

// 3. 闭包导致的内存泄漏演示
console.log('\n=== 闭包内存泄漏演示 ===');

function createLeakyClosure() {
  const largeData = new Array(100000).fill('leaky data');
  
  return function() {
    console.log('闭包函数被调用，largeData 长度:', largeData.length);
    // largeData 不会被回收，因为闭包持有引用
  };
}

const leakyFunction = createLeakyClosure();
leakyFunction(); // 调用闭包函数

// 4. 正确的事件监听器管理
console.log('\n=== 事件监听器管理演示 ===');

class EventManager {
  constructor() {
    this.handlers = new Map();
  }
  
  addHandler(element, event, handler) {
    element.addEventListener(event, handler);
    this.handlers.set(`${element.id}-${event}`, { element, event, handler });
    console.log(`添加了事件监听器: ${element.id}-${event}`);
  }
  
  removeHandler(element, event) {
    const key = `${element.id}-${event}`;
    const handlerInfo = this.handlers.get(key);
    
    if (handlerInfo) {
      handlerInfo.element.removeEventListener(handlerInfo.event, handlerInfo.handler);
      this.handlers.delete(key);
      console.log(`移除了事件监听器: ${key}`);
    }
  }
  
  removeAllHandlers() {
    this.handlers.forEach((handlerInfo, key) => {
      handlerInfo.element.removeEventListener(handlerInfo.event, handlerInfo.handler);
      console.log(`移除了事件监听器: ${key}`);
    });
    this.handlers.clear();
  }
}

// 5. WeakMap 和 WeakSet 演示
console.log('\n=== WeakMap 和 WeakSet 演示 ===');

// WeakMap 不会阻止键对象被垃圾回收
const weakMap = new WeakMap();
let obj = { id: 1 };

weakMap.set(obj, 'some data');
console.log('WeakMap 中存储了数据:', weakMap.has(obj));

// 当 obj 被设置为 null 时，WeakMap 中的条目也会被清理
obj = null;
console.log('obj 被设置为 null，WeakMap 中的条目也会被自动清理');

// 6. 内存使用监控
console.log('\n=== 内存使用监控 ===');

if (typeof performance !== 'undefined' && performance.memory) {
  const memoryInfo = performance.memory;
  console.log('当前内存使用情况:');
  console.log('- 已使用堆内存:', Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024), 'MB');
  console.log('- 堆内存限制:', Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024), 'MB');
  console.log('- 总堆内存:', Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024), 'MB');
}

// 7. 对象池模式演示
console.log('\n=== 对象池模式演示 ===');

class ArrayPool {
  constructor() {
    this.pool = [];
    this.createdCount = 0;
    this.reusedCount = 0;
  }
  
  get(size = 1000) {
    if (this.pool.length > 0) {
      const array = this.pool.pop();
      array.length = size; // 重置大小
      this.reusedCount++;
      console.log('从对象池中复用了数组');
      return array;
    }
    
    this.createdCount++;
    console.log('创建了新的数组');
    return new Array(size);
  }
  
  release(array) {
    array.length = 0; // 清空数组
    this.pool.push(array);
    console.log('将数组放回对象池');
  }
  
  getStats() {
    return {
      poolSize: this.pool.length,
      created: this.createdCount,
      reused: this.reusedCount
    };
  }
}

const arrayPool = new ArrayPool();

// 使用对象池
const arr1 = arrayPool.get(1000);
const arr2 = arrayPool.get(2000);
const arr3 = arrayPool.get(1500);

arrayPool.release(arr1);
arrayPool.release(arr2);

const arr4 = arrayPool.get(1000); // 这会复用 arr1

console.log('对象池统计:', arrayPool.getStats());

// 8. 手动触发垃圾回收（仅在开发模式下有效）
console.log('\n=== 手动垃圾回收 ===');

if (typeof window !== 'undefined' && window.gc) {
  console.log('手动触发垃圾回收...');
  window.gc();
  console.log('垃圾回收完成');
} else {
  console.log('无法手动触发垃圾回收（仅在开发模式下可用）');
}

console.log('\n=== 演示完成 ===');
console.log('提示：在浏览器开发者工具的 Memory 面板中可以查看内存使用情况'); 