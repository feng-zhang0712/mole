# React 项目优化 - 性能

## 一、介绍

## 二、组件渲染优化

### 2.1 免不必要的重渲染

使用 `React.memo` 进行组件缓存
合理使用 `useCallback` 和 `useMemo`
避免在渲染函数中创建对象和函数
使用 `useRef` 存储不需要触发重渲染的值

### 2.2 组件拆分和粒度控制

将大型组件拆分为更小的组件
使用容器组件和展示组件模式
合理控制组件的职责范围
避免过度抽象

### 2.3 状态管理优化

使用 `useReducer` 管理复杂状态
状态分片和局部化
避免状态提升过度
使用 Context API 优化状态传递

## 三、列表渲染优化

### 3.1 虚拟列表

使用 `react-window` 或 `react-virtualized`
实现固定高度的虚拟列表
实现可变高度的虚拟列表
虚拟列表的性能调优

### 3.2 列表项优化

优化 `key` 值的选择
避免使用索引作为key
使用稳定的唯一标识符
列表项的懒加载

## 四、事件处理优化

### 4.1 事件委托

在父组件中处理子组件事件
减少事件监听器数量
使用事件委托处理动态列表

### 4.2 防抖和节流

关于这部分，请参考 [防抖和节流](/2025/js/2025-08-01-debounce-and-throttle.md)。

## 长任务优化

Long Tasks（长任务）是指执行时间超过 50ms 的连续 JavaScript 执行任务，这些任务会阻塞主线程，导致页面卡顿、交互延迟。浏览器通常以 60fps 刷新页面（每帧约 16.67ms），50ms 相当于约 3 帧的时间，超过这个时间用户就能明显感知到卡顿。

Long Tasks 是影响 Core Web Vitals 中 INP（Interaction to Next Paint）指标的重要因素。

### Long Tasks 检测

#### PerformanceObserver

```javascript
const observer = new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    console.log('Long Task detected:', {
      duration: entry.duration,
      startTime: entry.startTime,
      name: entry.name
    });
  }
});

observer.observe({entryTypes: ['longtask']});
```

#### Performance 面板

Chrome Devtools Performance 面板的分析结果中，时间轴上的红色长条表示 Long Tasks，通过点击红色长条可以查看详细信息。

#### 第三方监控工具

使用 [web-vitals] 或者 [sentry-javascript]进行进行长任务监测。

[web-vitals]: https://github.com/GoogleChrome/web-vitals
[sentry-javascript]: https://github.com/getsentry/sentry-javascript

```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_DSN",
  integrations: [
    new Sentry.BrowserTracing({
      enableLongTask: true,
    }),
  ],
});
```

### Long Tasks 常见原因

- 复杂计算
- 大量 DOM 操作
- 事件处理函数
- 第三方库问题

### Long Tasks 优化策略

#### 任务分解

使用 setTimeout、MessageChannel、requestIdleCallback 等方法将大量的拆解并分片执行。

```javascript
function processWithMessageChannel(array, callback) {
  const channel = new MessageChannel();
  const chunkSize = 100;
  let index = 0;
  
  channel.port2.onmessage = function() {
    const start = index;
    const end = Math.min(index + chunkSize, array.length);
    
    for (let i = start; i < end; i++) {
      processItem(array[i]);
    }
    
    index = end;
    
    if (index < array.length) {
      channel.port1.postMessage(null);
    } else {
      callback && callback();
    }
  };
  
  channel.port1.postMessage(null);
}
```

#### Web Workers

将耗时的任务放入 Worker 线程执行。

#### React 中的 Long Tasks

使用 useDeferredValue、useMemo 和 React.memo。

```javascript
import React, { memo, useMemo, useDeferredValue } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  const deferredData = useDeferredValue(data);
  const processedData = useMemo(
    () => deferredData.map(heavyProcessing),
    [deferredData]
  );
  
  return (
    <div>
      {processedData.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
});
```

使用 React.lazy 和 Suspense

```javascript
import React, { Suspense, lazy } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

#### 优化动画和视觉效果

- 使用 CSS 动画替代 JavaScript 动画。
- 使用 transform 属性控制元素位置，避免不必要的重排。
