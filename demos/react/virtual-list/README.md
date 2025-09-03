# React 虚拟列表性能对比

这个项目展示了不同虚拟列表实现方式的性能和功能对比。

## 实现方式

### 1. 固定高度虚拟列表 (FixedHeightVirtualList)
- 使用传统的 `useState` 管理状态
- 适合固定高度的列表项
- 性能稳定，实现简单

### 2. 动态高度虚拟列表 (DynamicHeightVirtualList)
- 支持动态高度的列表项
- 使用缓存机制优化性能
- 适合内容高度不固定的场景

### 3. Intersection Observer 虚拟列表 (IntersectionObserverVirtualList)
- 使用 Intersection Observer API
- 更精确的可见性检测
- 减少滚动事件处理

### 4. Web Worker 虚拟列表 (WorkerBasedVirtualList)
- 使用 Web Worker 进行可见区域计算
- 避免主线程阻塞
- 适合大数据量场景

### 5. useReducer 虚拟列表 (ReducerBasedVirtualList) ⭐ 新增
- 使用 `useReducer` 管理复杂状态
- 状态逻辑集中管理
- 更好的可维护性和可测试性

## useReducer 版本特性

### 状态管理
```javascript
const {
  data,           // 列表数据
  totalCount,     // 总数量
  loading,        // 加载状态
  error,          // 错误信息
  searchQuery,    // 搜索查询
  searchError,    // 搜索错误
  scrollTop,      // 滚动位置
  computedRange,  // 计算出的可见范围
  // ... 更多状态
} = useVirtualListReducer();
```

### 操作方法
```javascript
const {
  getVisibleData,  // 获取可见区域数据
  search,          // 搜索功能
  refresh,         // 刷新数据
  setScrollTop,    // 设置滚动位置
  setComputedRange, // 设置计算范围
  // ... 更多方法
} = useVirtualListReducer();
```

### Action 类型
```javascript
import { ACTIONS } from './hooks/useVirtualListReducer';

// 可用的 action 类型
ACTIONS.SET_DATA
ACTIONS.SET_TOTAL_COUNT
ACTIONS.SET_LOADING
ACTIONS.SET_ERROR
ACTIONS.SET_SEARCH_QUERY
ACTIONS.SET_SEARCH_LOADING
ACTIONS.SET_SEARCH_ERROR
ACTIONS.SET_SCROLL_TOP
ACTIONS.SET_COMPUTED_RANGE
ACTIONS.RESET_SEARCH
ACTIONS.CLEAR_ERROR
ACTIONS.CLEAR_SEARCH_ERROR
// ... 更多
```

## 使用示例

### 基本使用
```javascript
import { useVirtualListReducer } from './hooks/useVirtualListReducer';

function MyVirtualList() {
  const {
    data,
    loading,
    error,
    getVisibleData,
    search,
    refresh
  } = useVirtualListReducer();

  // 使用组件...
}
```

### 自定义 Reducer
```javascript
import { useVirtualListReducer, ACTIONS } from './hooks/useVirtualListReducer';

function MyCustomVirtualList() {
  const {
    data,
    loading,
    // 获取 dispatch 函数进行自定义操作
    dispatch
  } = useVirtualListReducer();

  const handleCustomAction = () => {
    dispatch({
      type: ACTIONS.SET_DATA,
      payload: customData
    });
  };

  // 使用组件...
}
```

## 性能对比

| 实现方式 | 状态管理 | 性能 | 可维护性 | 适用场景 |
|----------|----------|------|----------|----------|
| useState | 分散 | 中等 | 中等 | 简单应用 |
| useReducer | 集中 | 高 | 高 | 复杂应用 |
| Web Worker | 异步 | 最高 | 中等 | 大数据量 |
| Intersection Observer | 精确 | 高 | 中等 | 精确检测 |

## 运行项目

```bash
npm install
npm start
```

访问 http://localhost:3000 查看不同实现方式的对比。
