# Scheduler、Reconciler 和 Renderer

## Scheduler

### 概述

React Scheduler（调度器）是 React 并发特性的核心组件，负责管理和调度任务的执行。它实现了时间切片（Time Slicing）机制，确保高优先级任务能够及时响应，同时不阻塞用户交互。

Scheduler 有两个核心概念：**优先级系统**和**任务队列**。

Scheduler 定义了 5 个优先级级别。

- `NoPriority`：
- `ImmediatePriority`：立即执行。
- `UserBlockingPriority`：用户阻塞优先级。
- `NormalPriority`：正常先级。
- `LowPriority`：低优先级。
- `IdlePriority`：空闲优先级。

Scheduler 使用两个队列管理任务。

- taskQueue：立即执行的任务队列（最小堆）。
- timerQueue：延迟执行的任务队列（最小堆）。

### 核心数据结构

#### Task 对象

```javascript
export type Task = {
  id: number,                    // 任务唯一标识
  callback: Callback | null,     // 任务回调函数
  priorityLevel: PriorityLevel,  // 优先级级别
  startTime: number,             // 开始时间
  expirationTime: number,        // 过期时间
  sortIndex: number,             // 排序索引
  isQueued?: boolean,           // 是否已入队
};
```

#### 最小堆实现

Scheduler 使用最小堆来管理任务队列，确保优先级最高的任务始终在堆顶。

```javascript
// 插入任务
export function push<T: Node>(heap: Heap<T>, node: T): void {
  const index = heap.length;
  heap.push(node);
  siftUp(heap, node, index);
}

// 获取堆顶任务
export function peek<T: Node>(heap: Heap<T>): T | null {
  return heap.length === 0 ? null : heap[0];
}

// 移除堆顶任务
export function pop<T: Node>(heap: Heap<T>): T | null {
  if (heap.length === 0) {
    return null;
  }
  const first = heap[0];
  const last = heap.pop();
  if (last !== first) {
    heap[0] = last;
    siftDown(heap, last, 0);
  }
  return first;
}
```

### 核心API

#### 1. 调度任务

根据优先级调度任务。

```javascript
function unstable_scheduleCallback(
  priorityLevel: PriorityLevel, // 任务优先级
  callback: Callback, // 任务回调函数
  options?: {delay?: number, timeout?: number} // 可选配置（延迟时间、超时时间）
): Task
```

#### 2. 取消任务

取消已调度的任务。

```javascript
function unstable_cancelCallback(task: Task): void
```

#### 3. 获取当前优先级

获取当前正在执行任务的优先级。

```javascript
function unstable_getCurrentPriorityLevel(): PriorityLevel
```

#### 4. 检查是否应该让出控制权

检查是否应该让出控制权给浏览器。

```javascript
function shouldYieldToHost(): boolean
```

### 工作循环机制

#### 1. 主工作循环

```javascript
function workLoop(initialTime: number) {
  let currentTime = initialTime;
  advanceTimers(currentTime);
  currentTask = peek(taskQueue);
  
  while (currentTask !== null) {
    // 检查是否应该让出控制权
    if (currentTask.expirationTime > currentTime && shouldYieldToHost()) {
      break;
    }
    
    const callback = currentTask.callback;
    if (typeof callback === 'function') {
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      
      // 执行任务回调
      const continuationCallback = callback(didUserCallbackTimeout);
      currentTime = getCurrentTime();
      
      if (typeof continuationCallback === 'function') {
        // 任务未完成，继续执行
        currentTask.callback = continuationCallback;
        return true;
      } else {
        // 任务完成，从队列中移除
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }
    } else {
      pop(taskQueue);
    }
    currentTask = peek(taskQueue);
  }
  
  return currentTask !== null;
}
```

#### 2. 时间切片机制

Scheduler 通过 `shouldYieldToHost()` 函数实现时间切片。

```javascript
function shouldYieldToHost(): boolean {
  const timeElapsed = getCurrentTime() - startTime;
  if (timeElapsed < frameInterval) {
    // 时间片未用完，继续执行
    return false;
  }
  // 时间片用完，让出控制权
  return true;
}
```

### 调度策略

#### 1. 优先级调度

- `ImmediatePriority`: 立即执行，不参与时间切片。
- `UserBlockingPriority`: 用户交互相关，高优先级。
  `NormalPriority`: 普通任务，参与时间切片。
- `LowPriority`: 低优先级任务，可被中断。
- `IdlePriority`: 空闲时执行。

#### 2. 任务调度流程

1. 任务入队: 根据优先级和过期时间决定进入哪个队列
2. 时间片分配: 为每个任务分配执行时间
3. 让出控制权: 时间片用完时让出控制权给浏览器
4. 任务恢复: 浏览器空闲时恢复任务执行

#### 3. 延迟任务处理

```javascript
function advanceTimers(currentTime: number) {
  let timer = peek(timerQueue);
  while (timer !== null) {
    if (timer.callback === null) {
      // 任务已取消
      pop(timerQueue);
    } else if (timer.startTime <= currentTime) {
      // 延迟任务到期，转移到执行队列
      pop(timerQueue);
      timer.sortIndex = timer.expirationTime;
      push(taskQueue, timer);
    } else {
      // 延迟任务还未到期
      return;
    }
    timer = peek(timerQueue);
  }
}
```

### 与 React 的集成

#### 1. React Reconciler 中的使用

```javascript
// packages/react-reconciler/src/Scheduler.js
import * as Scheduler from 'scheduler';

export const scheduleCallback = Scheduler.unstable_scheduleCallback;
export const cancelCallback = Scheduler.unstable_cancelCallback;
export const shouldYield = Scheduler.unstable_shouldYield;
export const requestPaint = Scheduler.unstable_requestPaint;
export const now = Scheduler.unstable_now;
```

#### 2. 在 Fiber 工作循环中的应用

- React 使用 Scheduler 来调度 Fiber 节点的处理
- 高优先级的更新（如用户交互）会立即调度
- 低优先级的更新会被延迟执行

### 性能优化特性

#### 1. 时间切片

- 将长时间任务分割成小的时间片
- 确保浏览器能够响应用户交互
- 避免页面卡顿

#### 2. 优先级调度

- 根据任务重要性分配优先级
- 确保关键任务优先执行
- 提高用户体验

#### 3. 任务取消

- 支持取消已调度的任务
- 避免不必要的计算
- 优化性能

### 面试重点

#### 1. Scheduler 的作用

- 实现时间切片，避免阻塞主线程
- 管理任务优先级，确保关键任务优先执行
- 提供任务调度和取消机制

#### 2. 时间切片原理

- 将长时间任务分割成小的时间片
- 在时间片之间让出控制权给浏览器
- 确保用户交互的响应性

#### 3. 优先级系统

- 5个优先级级别的设计
- 不同优先级任务的调度策略
- 优先级对任务执行顺序的影响

#### 4. 与 React 的协作

- Scheduler 为 React 提供调度能力
- React 使用 Scheduler 实现并发特性
- 两者共同实现 React 18 的并发渲染

## Reconciler

### 概述

React Reconciler（协调器）是 React 的核心协调器，负责管理组件的渲染和更新过程。它是 React 三大核心模块之一，与 Scheduler 和 Renderer 协同工作，实现 React 的虚拟 DOM diff 算法和状态管理。

### 核心职责

#### 1. 虚拟DOM协调

- 比较新旧虚拟DOM树的差异
- 生成最小化的DOM操作指令
- 管理组件的生命周期

#### 2. 状态管理

- 管理组件的状态更新
- 处理Hooks的状态逻辑
- 协调批量更新

#### 3. 优先级调度

- 与Scheduler协作进行任务调度
- 处理不同优先级的更新
- 实现时间切片

### 核心文件结构

```text
packages/react-reconciler/src/
├── ReactFiberReconciler.js    # 协调器入口 ⭐⭐⭐⭐⭐
├── ReactFiberWorkLoop.js      # 工作循环 ⭐⭐⭐⭐⭐
├── ReactFiberBeginWork.js     # 开始工作 ⭐⭐⭐⭐
├── ReactFiberCompleteWork.js  # 完成工作 ⭐⭐⭐⭐
├── ReactFiberCommitWork.js    # 提交工作 ⭐⭐⭐⭐
├── ReactFiberHooks.js         # Hooks实现 ⭐⭐⭐⭐⭐
├── ReactFiberLane.js          # 优先级系统 ⭐⭐⭐⭐⭐
├── ReactFiber.js              # Fiber节点定义 ⭐⭐⭐⭐⭐
└── ReactInternalTypes.js      # 内部类型定义 ⭐⭐⭐
```

### 核心API

#### 1. 容器创建

创建 React 根容器。

```typescript
export function createContainer(
  containerInfo: Container, // 容器信息（如DOM元素）
  tag: RootTag, // 根类型（LegacyRoot、ConcurrentRoot等）
  hydrationCallbacks: null | SuspenseHydrationCallbacks, // 水合回调
  isStrictMode: boolean, // 是否启用严格模式
  concurrentUpdatesByDefaultOverride: null | boolean,
  identifierPrefix: string,
  onUncaughtError: (error: mixed, errorInfo: {+componentStack?: ?string}) => void, // 未捕获错误处理
  onCaughtError: (error: mixed, errorInfo: {+componentStack?: ?string, +errorBoundary?: ?React$Component<any, any>}) => void, // 已捕获错误处理
  onRecoverableError: (error: mixed, errorInfo: {+componentStack?: ?string}) => void, // 可恢复错误处理
  transitionCallbacks: null | TransitionTracingCallbacks,
): OpaqueRoot
```

#### 2. 容器更新

更新容器内容。

```javascript
export function updateContainer(
  element: ReactNodeList, // 要渲染的React元素
  container: OpaqueRoot, // 容器对象
  parentComponent: ?React$Component<any, any>, // 父组件
  callback: ?Function, // 更新完成回调
): Lane
```

#### 3. 同步更新

同步更新容器（绕过调度器）。

```javascript
export function updateContainerSync(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function,
): Lane
```

### 工作循环机制

#### 1. 渲染阶段 (Render Phase)

```javascript
function renderRootSync(
  root: FiberRoot,
  lanes: Lanes,
  shouldYieldForPrerendering: boolean,
): RootExitStatus {
  // 同步渲染逻辑
  do {
    try {
      workLoopSync();
      break;
    } catch (value) {
      // 错误处理
    }
  } while (true);
}
```

#### 2. 并发渲染

```javascript
function renderRootConcurrent(
  root: FiberRoot,
  lanes: Lanes,
): RootExitStatus {
  // 并发渲染逻辑
  do {
    try {
      workLoopConcurrent();
      break;
    } catch (value) {
      // 错误处理
    }
  } while (true);
}
```

#### 3. 工作循环

```javascript
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

### 协调算法

#### 1. 双缓存机制

Reconciler 使用双缓存机制来管理 Fiber 树：

- current树: 当前已渲染的 Fiber 树。
- workInProgress树: 正在构建的新 Fiber 树。

#### 2. 深度优先遍历

```javascript
function performUnitOfWork(unitOfWork: Fiber): void {
  const current = unitOfWork.alternate;
  
  let next;
  if (unitOfWork.mode & ProfileMode) {
    startProfilerTimer(unitOfWork);
  }
  
  next = beginWork(current, unitOfWork, renderLanes);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  
  if (next === null) {
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}
```

#### 3. 开始工作 (Begin Work)

```javascript
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  // 根据Fiber类型执行不同的处理逻辑
  switch (workInProgress.tag) {
    case FunctionComponent:
      return updateFunctionComponent(current, workInProgress, renderLanes);
    case ClassComponent:
      return updateClassComponent(current, workInProgress, renderLanes);
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes);
    // ... 其他类型
  }
}
```

#### 4. 完成工作 (Complete Work)

```javascript
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
): void {
  const newProps = workInProgress.pendingProps;
  
  switch (workInProgress.tag) {
    case FunctionComponent:
    case ClassComponent:
      // 函数组件和类组件的完成逻辑
      break;
    case HostComponent: {
      // 原生DOM组件的完成逻辑
      const type = workInProgress.type;
      if (current !== null && workInProgress.stateNode != null) {
        // 更新现有DOM节点
        updateHostComponent(current, workInProgress, type, newProps);
      } else {
        // 创建新的DOM节点
        const instance = createInstance(type, newProps, workInProgress);
        workInProgress.stateNode = instance;
      }
      break;
    }
  }
}
```

### 更新机制

#### 1. 更新队列

```javascript
function updateContainerImpl(
  rootFiber: Fiber,
  lane: Lane,
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function,
): void {
  const update = createUpdate(lane);
  update.payload = {element};
  
  if (callback !== null) {
    update.callback = callback;
  }
  
  const root = enqueueUpdate(rootFiber, update, lane);
  if (root !== null) {
    scheduleUpdateOnFiber(root, rootFiber, lane);
  }
}
```

#### 2. 批量更新

```javascript
export function batchedUpdates<A, R>(
  fn: A => R,
  a: A,
): R {
  const prevExecutionContext = executionContext;
  executionContext |= BatchedContext;
  try {
    return fn(a);
  } finally {
    executionContext = prevExecutionContext;
    if (executionContext === NoContext) {
      flushSyncCallbacksOnlyInLegacyMode();
    }
  }
}
```

### 错误处理

#### 1. 错误边界

```javascript
function throwIfInfiniteUpdateLoopDetected() {
  if (__DEV__) {
    const fiber = getWorkInProgressFiber();
    if (fiber !== null) {
      const alternate = fiber.alternate;
      if (alternate !== null) {
        const alternateKey = alternate.memoizedProps;
        const fiberKey = fiber.memoizedProps;
        if (alternateKey === fiberKey) {
          // 检测到无限更新循环
          throw new Error('Maximum update depth exceeded.');
        }
      }
    }
  }
}
```

#### 2. 错误恢复

```javascript
function handleError(
  root: FiberRoot,
  thrownValue: mixed,
): void {
  // 错误处理逻辑
  // 1. 查找错误边界
  // 2. 调用错误边界组件
  // 3. 重新渲染错误UI
}
```

### 性能优化

#### 1. 早期退出

```javascript
function bailoutOnAlreadyFinishedWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  // 如果组件没有更新，直接复用现有Fiber
  if (!includesSomeLane(renderLanes, workInProgress.childLanes)) {
    return null;
  }
  
  // 克隆子Fiber并继续工作
  cloneChildFibers(current, workInProgress);
  return workInProgress.child;
}
```

#### 2. 优先级调度

```javascript
function requestUpdateLane(fiber: Fiber): Lane {
  // 根据更新类型和上下文确定优先级
  const mode = fiber.mode;
  if ((mode & ConcurrentMode) === NoMode) {
    return SyncLane;
  }
  
  const eventTime = requestEventTime();
  const priority = getCurrentPriorityLevel();
  
  switch (priority) {
    case ImmediatePriority:
      return SyncLane;
    case UserBlockingPriority:
      return InputContinuousLane;
    case NormalPriority:
      return DefaultLane;
    case LowPriority:
      return IdleLane;
    case IdlePriority:
      return IdleLane;
    default:
      return DefaultLane;
  }
}
```

### 与 Renderer 的协作

#### 1. 副作用收集

Reconciler 在渲染阶段收集副作用，在提交阶段交给 Renderer 执行：

```javascript
// 渲染阶段：收集副作用
workInProgress.flags |= Placement; // 标记需要插入
workInProgress.flags |= Update;    // 标记需要更新
workInProgress.flags |= Deletion;  // 标记需要删除

// 提交阶段：执行副作用
function commitPlacement(finishedWork: Fiber): void {
  // 执行DOM插入操作
}

function commitUpdate(finishedWork: Fiber): void {
  // 执行DOM更新操作
}

function commitDeletion(finishedWork: Fiber): void {
  // 执行DOM删除操作
}
```

#### 2. 事件处理

```javascript
function commitEventEffects(
  root: FiberRoot,
  committedLanes: Lanes,
): void {
  // 处理事件监听器的添加和移除
  const eventHandlerListeners = root.eventHandlerListeners;
  if (eventHandlerListeners !== null) {
    // 执行事件处理逻辑
  }
}
```

### 面试重点

#### 1. Reconciler的作用

- 实现虚拟DOM的diff算法
- 管理组件的渲染和更新
- 与Scheduler协作实现并发渲染
- 收集副作用交给Renderer执行

#### 2. 双缓存机制

- current树：当前已渲染的Fiber树
- workInProgress树：正在构建的新Fiber树
- 避免直接操作当前树，保证渲染的稳定性

#### 3. 工作循环

- 深度优先遍历Fiber树
- 分为开始工作和完成工作两个阶段
- 支持时间切片和优先级调度

#### 4. 更新机制

- 基于优先级的更新调度
- 批量更新优化
- 早期退出机制

#### 5. 错误处理

- 错误边界机制
- 错误恢复和重试
- 无限循环检测






## Renderer

### 概述

React Renderer（渲染器详）是 React 三大核心模块之一，负责将 Reconciler 生成的虚拟 DO M转换为实际的平台特定代码。React 支持多种渲染器，包括 React DOM（Web）、React Native（移动端）、React Art（Canvas）等。

### 核心职责

#### 1. 平台特定渲染

- 将虚拟DOM转换为平台特定的UI元素
- 处理平台特定的API和属性
- 管理平台特定的生命周期

#### 2. 事件处理

- 实现跨平台的事件系统
- 处理用户交互事件
- 提供统一的事件API

#### 3. 副作用执行

- 执行Reconciler收集的副作用
- 管理DOM操作
- 处理样式和属性更新

### React DOM 渲染器架构

#### 1. 核心文件结构

```text
packages/react-dom/
├── src/
│   ├── client/
│   │   ├── ReactDOMClient.js      # 客户端入口 ⭐⭐⭐⭐⭐
│   │   ├── ReactDOMRoot.js        # 根容器管理 ⭐⭐⭐⭐⭐
│   │   └── ReactDOMRootFB.js      # Facebook特定版本
│   ├── server/
│   │   └── ReactDOMServer.js      # 服务端渲染
│   └── shared/
│       └── ReactDOMSharedInternals.js # 共享内部API
```

```text
packages/react-dom-bindings/
├── src/
│   ├── client/
│   │   ├── ReactDOMComponent.js   # DOM组件实现 ⭐⭐⭐⭐⭐
│   │   ├── ReactFiberConfigDOM.js # DOM配置 ⭐⭐⭐⭐
│   │   ├── DOMPropertyOperations.js # DOM属性操作 ⭐⭐⭐⭐
│   │   ├── CSSPropertyOperations.js # CSS样式操作 ⭐⭐⭐⭐
│   │   └── ReactDOMComponentTree.js # DOM组件树 ⭐⭐⭐
│   └── events/
│       ├── DOMPluginEventSystem.js # 事件系统 ⭐⭐⭐⭐⭐
│       ├── SyntheticEvent.js      # 合成事件 ⭐⭐⭐⭐
│       └── plugins/               # 事件插件
```

### 核心API

#### 1. 创建根容器

创建React 18的并发根容器。

```javascript
export function createRoot(
  container: Element | DocumentFragment, // DOM 容器元素
  options?: CreateRootOptions, // 配置选项（严格模式、错误处理等）
): RootType {
  if (!isValidContainer(container)) {
    throw new Error('Target container is not a DOM element.');
  }
  
  const root = createContainer(
    container,
    ConcurrentRoot,
    null,
    options?.unstable_strictMode ?? false,
    null,
    options?.identifierPrefix ?? '',
    options?.onUncaughtError,
    options?.onCaughtError,
    options?.onRecoverableError,
    options?.unstable_transitionCallbacks,
  );
  
  return new ReactDOMRoot(root);
}
```

#### 2. 渲染方法

渲染 React 元素到容器。

```javascript
ReactDOMRoot.prototype.render = function(children: ReactNodeList): void {
  const root = this._internalRoot;
  if (root === null) {
    throw new Error('Cannot update an unmounted root.');
  }
  
  updateContainer(children, root, null, null);
};
```

#### 3. 卸载方法

卸载 React 应用。

```javascript
ReactDOMRoot.prototype.unmount = function(): void {
  const root = this._internalRoot;
  if (root !== null) {
    updateContainer(null, root, null, () => {
      unmarkContainerAsRoot(root.containerInfo);
    });
  }
};
```

### DOM 组件实现

#### 1. 组件创建

```javascript
export function createInstance(
  type: string,
  props: Object,
  internalInstanceHandle: Object,
): Element {
  const domElement = document.createElement(type);
  precacheFiberNode(internalInstanceHandle, domElement);
  updateFiberProps(domElement, props);
  return domElement;
}
```

#### 2. 属性设置

```javascript
export function setInitialProperties(
  domElement: Element,
  tag: string,
  props: Object,
): void {
  // 设置初始属性
  for (const propKey in props) {
    if (props.hasOwnProperty(propKey)) {
      const nextProp = props[propKey];
      const lastProp = null;
      
      setProp(domElement, tag, propKey, nextProp, props, lastProp);
    }
  }
}
```

#### 3. 属性更新

```javascript
export function updateProperties(
  domElement: Element,
  tag: string,
  lastProps: Object,
  nextProps: Object,
): void {
  // 更新属性
  for (const propKey in nextProps) {
    if (nextProps.hasOwnProperty(propKey)) {
      const nextProp = nextProps[propKey];
      const lastProp = lastProps[propKey];
      
      if (nextProp !== lastProp) {
        setProp(domElement, tag, propKey, nextProp, nextProps, lastProp);
      }
    }
  }
  
  // 移除不再存在的属性
  for (const propKey in lastProps) {
    if (lastProps.hasOwnProperty(propKey) && !nextProps.hasOwnProperty(propKey)) {
      setProp(domElement, tag, propKey, null, nextProps, lastProps[propKey]);
    }
  }
}
```

### 事件系统

#### 1. 事件注册

```javascript
export function listenToAllSupportedEvents(rootContainerElement: EventTarget) {
  // 监听所有支持的事件
  allNativeEvents.forEach(domEventName => {
    if (!nonDelegatedEvents.has(domEventName)) {
      listenToNativeEvent(domEventName, false, rootContainerElement);
    }
  });
}
```

#### 2. 事件分发

```javascript
export function dispatchEventForPluginEventSystem(
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  nativeEvent: AnyNativeEvent,
  targetInst: null | Fiber,
  targetContainer: EventTarget,
): void {
  // 创建合成事件
  const event = new SyntheticEvent(
    nativeEvent,
    targetInst,
    targetContainer,
    domEventName,
  );
  
  // 收集事件监听器
  const listeners = accumulateSinglePhaseListeners(
    targetInst,
    reactName,
    nativeEventType,
    inCapturePhase,
    false,
    nativeEvent,
  );
  
  // 执行事件监听器
  processDispatchQueue([{event, listeners}], eventSystemFlags);
}
```

#### 3. 合成事件

```javascript
export class SyntheticEvent {
  constructor(
    nativeEvent: AnyNativeEvent,
    targetInst: null | Fiber,
    targetContainer: EventTarget,
    domEventName: DOMEventName,
  ) {
    this.nativeEvent = nativeEvent;
    this.targetInst = targetInst;
    this.targetContainer = targetContainer;
    this.domEventName = domEventName;
    
    // 复制原生事件属性
    this.timeStamp = nativeEvent.timeStamp;
    this.type = nativeEvent.type;
    this.target = nativeEvent.target;
    this.currentTarget = nativeEvent.currentTarget;
  }
  
  preventDefault(): void {
    this.defaultPrevented = true;
    const event = this.nativeEvent;
    if (!event.cancelable) {
      return;
    }
    event.preventDefault();
  }
  
  stopPropagation(): void {
    const event = this.nativeEvent;
    if (!event.bubbles) {
      return;
    }
    event.stopPropagation();
    this.isPropagationStopped = () => true;
  }
}
```

### 样式处理

#### 1. CSS 属性操作

```javascript
export function setValueForStyles(
  node: HTMLElement,
  styles: CSSProperties,
  prevStyles: CSSProperties,
): void {
  const style = node.style;
  
  // 处理样式更新
  for (const styleName in styles) {
    if (styles.hasOwnProperty(styleName)) {
      const value = styles[styleName];
      const prevValue = prevStyles[styleName];
      
      if (value !== prevValue) {
        if (value == null) {
          // 移除样式
          style[styleName] = '';
        } else {
          // 设置样式
          style[styleName] = value;
        }
      }
    }
  }
  
  // 移除不再存在的样式
  for (const styleName in prevStyles) {
    if (prevStyles.hasOwnProperty(styleName) && !styles.hasOwnProperty(styleName)) {
      style[styleName] = '';
    }
  }
}
```

#### 2. 样式验证

```javascript
export function validateShorthandPropertyCollisionInDev(
  styleUpdates: Object,
  nextStyles: Object,
): void {
  if (__DEV__) {
    // 检查简写属性冲突
    for (const key in styleUpdates) {
      if (styleUpdates.hasOwnProperty(key)) {
        const longhandProperties = CSSShorthandProperty.getLonghandProperties(key);
        if (longhandProperties) {
          for (const longhand of longhandProperties) {
            if (nextStyles.hasOwnProperty(longhand)) {
              console.error(
                'Shorthand property `%s` is incompatible with `%s`',
                key,
                longhand,
              );
            }
          }
        }
      }
    }
  }
}
```

### 水合(Hydration)

#### 1. 水合根容器

```javascript
export function hydrateRoot(
  container: Element | DocumentFragment,
  initialChildren: ReactNodeList,
  options?: HydrateRootOptions,
): RootType {
  if (!isValidContainer(container)) {
    throw new Error('Target container is not a DOM element.');
  }
  
  const root = createHydrationContainer(
    initialChildren,
    null,
    container,
    ConcurrentRoot,
    null,
    options?.unstable_strictMode ?? false,
    options?.identifierPrefix ?? '',
    options?.onUncaughtError,
    options?.onCaughtError,
    options?.onRecoverableError,
    options?.unstable_transitionCallbacks,
    options?.formState ?? null,
  );
  
  return new ReactDOMHydrationRoot(root);
}
```

#### 2. 水合属性

```javascript
export function hydrateProperties(
  domElement: Element,
  tag: string,
  props: Object,
  hostContext: HostContext,
): boolean {
  // 水合DOM属性
  for (const propKey in props) {
    if (props.hasOwnProperty(propKey)) {
      const value = props[propKey];
      hydrateAttribute(domElement, propKey, propKey, value, new Set(), {});
    }
  }
  
  return true;
}
```

### 错误处理

#### 1. 错误边界集成

```javascript
function handleError(
  error: mixed,
  errorInfo: {+componentStack?: ?string},
): void {
  // 处理渲染错误
  if (onUncaughtError) {
    onUncaughtError(error, errorInfo);
  } else {
    // 默认错误处理
    console.error('Uncaught error:', error);
  }
}
```

#### 2. 开发环境警告

```javascript
function validateContainer(container: Element): void {
  if (__DEV__) {
    if (container.nodeType !== ELEMENT_NODE && container.nodeType !== DOCUMENT_FRAGMENT_NODE) {
      console.error(
        'Target container is not a DOM element.',
      );
    }
  }
}
```

### 性能优化

#### 1. 批量更新

```javascript
export function batchedUpdates<A, R>(
  fn: A => R,
  a: A,
): R {
  const prevExecutionContext = executionContext;
  executionContext |= BatchedContext;
  try {
    return fn(a);
  } finally {
    executionContext = prevExecutionContext;
    if (executionContext === NoContext) {
      flushSyncCallbacksOnlyInLegacyMode();
    }
  }
}
```

#### 2. 事件委托

```javascript
function addTrappedEventListener(
  targetContainer: EventTarget,
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  isCapturePhaseListener: boolean,
): void {
  // 使用事件委托优化性能
  const listener = createEventListenerWrapperWithPriority(
    targetContainer,
    domEventName,
    eventSystemFlags,
  );
  
  if (isCapturePhaseListener) {
    addEventCaptureListener(targetContainer, domEventName, listener);
  } else {
    addEventBubbleListener(targetContainer, domEventName, listener);
  }
}
```

### 与其他模块的协作

#### 1. 与 Reconciler 的协作

```javascript
// Reconciler 收集副作用
workInProgress.flags |= Placement; // 标记需要插入
workInProgress.flags |= Update;    // 标记需要更新
workInProgress.flags |= Deletion;  // 标记需要删除

// Renderer 执行副作用
function commitPlacement(finishedWork: Fiber): void {
  const parentFiber = getHostParentFiber(finishedWork);
  const parent = parentFiber.stateNode;
  
  if (parentFiber.flags & ContentReset) {
    resetTextContent(parent);
    parentFiber.flags &= ~ContentReset;
  }
  
  const before = getHostSibling(finishedWork);
  insertOrAppendPlacementNode(finishedWork, before, parent);
}
```

#### 2. 与 Scheduler 的协作

```javascript
// 使用 Scheduler 进行优先级调度
import {
  scheduleCallback,
  shouldYield,
  requestPaint,
} from 'scheduler';

function commitRoot(root: FiberRoot): void {
  // 在提交阶段使用调度器
  if (shouldYield()) {
    // 让出控制权
    return;
  }
  
  // 执行DOM操作
  commitPlacement(finishedWork);
  commitUpdate(finishedWork);
  commitDeletion(finishedWork);
}
```

### 面试重点

#### 1. Renderer 的作用

- 将虚拟DOM转换为平台特定代码
- 执行Reconciler收集的副作用
- 提供统一的事件系统
- 处理平台特定的API

#### 2. 事件系统

- 合成事件机制
- 事件委托优化
- 跨平台事件处理
- 事件优先级

#### 3. 水合机制

- 服务端渲染集成
- 客户端水合过程
- 水合错误处理
- 性能优化

#### 4. 性能优化

- 批量更新机制
- 事件委托
- 样式优化
- 错误边界

#### 5. 平台适配

- 多平台支持
- 平台特定API
- 统一接口设计
- 扩展性考虑




## 三大核心模块协作机制

### 概述

React 的三大核心模块（Scheduler、Reconciler、Renderer）通过精心设计的协作机制，实现了高效的虚拟DOM渲染和更新。这三个模块各司其职，相互配合，构成了 React 的核心架构。

### 三大模块职责分工

#### 1. Scheduler（调度器）

- **职责**: 任务优先级调度、时间切片、让出控制权
- **核心功能**: 管理任务队列、决定何时执行任务、何时让出控制权
- **关键API**: `scheduleCallback`、`shouldYield`、`requestPaint`

#### 2. Reconciler（协调器）

- **职责**: 虚拟DOM diff、Fiber 树构建、副作用收集
- **核心功能**: 比较新旧虚拟DOM、生成更新计划、收集副作用
- **关键API**: `beginWork`、`completeWork`、`performUnitOfWork`

#### 3. Renderer（渲染器）

- **职责**: 平台特定渲染、副作用执行、事件处理
- **核心功能**: 将虚拟 DOM 转换为平台代码、执行DOM操作、处理用户交互
- **关键API**: `commitPlacement`、`commitUpdate`、`commitDeletion`

### 整体工作流程

#### 阶段1: 触发更新

```javascript
// 用户交互或程序触发更新
setState(newState);
// 或
dispatch(action);
```

#### 阶段2: 创建更新

```javascript
// Reconciler创建更新对象
function createUpdate(lane: Lane): Update<State> {
  const update: Update<State> = {
    lane,
    action,
    hasEagerState: false,
    eagerState: null,
    next: null,
  };
  return update;
}

// 将更新加入队列
function enqueueUpdate(fiber: Fiber, update: Update<State>, lane: Lane): FiberRoot | null {
  const updateQueue = fiber.updateQueue;
  if (updateQueue === null) {
    // 创建新的更新队列
    return null;
  }
  
  const sharedQueue = updateQueue.shared;
  const pending = sharedQueue.pending;
  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  sharedQueue.pending = update;
  
  return markUpdateLaneFromFiberToRoot(fiber, lane);
}
```

#### 阶段3: 调度更新

```javascript
// Scheduler根据优先级调度任务
function scheduleUpdateOnFiber(root: FiberRoot, fiber: Fiber, lane: Lane): void {
  const priorityLevel = getCurrentPriorityLevel();
  
  // 根据优先级创建调度任务
  const newTask = {
    id: taskIdCounter++,
    callback: performConcurrentWorkOnRoot.bind(null, root),
    priorityLevel,
    startTime: getCurrentTime(),
    expirationTime: computeExpirationForFiber(lane),
    sortIndex: -1,
  };
  
  // 将任务加入调度队列
  scheduleCallback(priorityLevel, newTask);
}
```

#### 阶段4: 渲染阶段（Render Phase）

##### 4.1 开始渲染

```javascript
function performConcurrentWorkOnRoot(root: FiberRoot): void {
  // 检查是否需要让出控制权
  if (shouldYield()) {
    // 让出控制权，稍后继续
    return performConcurrentWorkOnRoot.bind(null, root);
  }
  
  // 开始渲染
  const lanes = getNextLanes(root);
  const exitStatus = renderRootConcurrent(root, lanes);
  
  if (exitStatus === RootInProgress) {
    // 渲染未完成，继续
    return performConcurrentWorkOnRoot.bind(null, root);
  }
  
  // 渲染完成，进入提交阶段
  const finishedWork = root.current.alternate;
  finishConcurrentRender(root, exitStatus, finishedWork, lanes);
}
```

##### 4.2 工作循环

```javascript
function workLoopConcurrent(): void {
  // 并发工作循环
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork: Fiber): void {
  const current = unitOfWork.alternate;
  
  // 开始工作（beginWork）
  let next = beginWork(current, unitOfWork, renderLanes);
  
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  
  if (next === null) {
    // 没有子节点，完成当前工作
    completeUnitOfWork(unitOfWork);
  } else {
    // 继续处理子节点
    workInProgress = next;
  }
}
```

##### 4.3 开始工作（Begin Work）

```javascript
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  // 根据Fiber类型执行不同的处理逻辑
  switch (workInProgress.tag) {
    case FunctionComponent:
      return updateFunctionComponent(current, workInProgress, renderLanes);
    case ClassComponent:
      return updateClassComponent(current, workInProgress, renderLanes);
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes);
    // ... 其他类型
  }
}

function updateFunctionComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  const Component = workInProgress.type;
  const props = workInProgress.pendingProps;
  
  // 执行函数组件
  const nextChildren = Component(props);
  
  // 协调子节点
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  
  return workInProgress.child;
}
```

##### 4.4 完成工作（Complete Work）

```javascript
function completeUnitOfWork(unitOfWork: Fiber): void {
  let completedWork = unitOfWork;
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    
    // 完成当前工作
    completeWork(current, completedWork);
    
    // 收集副作用
    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      workInProgress = siblingFiber;
      return;
    }
    
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);
}

function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
): void {
  const newProps = workInProgress.pendingProps;
  
  switch (workInProgress.tag) {
    case HostComponent: {
      // 创建或更新DOM节点
      if (current !== null && workInProgress.stateNode != null) {
        // 更新现有DOM节点
        updateHostComponent(current, workInProgress, type, newProps);
      } else {
        // 创建新的DOM节点
        const instance = createInstance(type, newProps, workInProgress);
        workInProgress.stateNode = instance;
      }
      break;
    }
    // ... 其他类型
  }
}
```

#### 阶段5: 提交阶段（Commit Phase）

##### 5.1 开始提交

```javascript
function commitRoot(root: FiberRoot): void {
  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes;
  
  // 标记提交开始
  root.finishedWork = null;
  root.finishedLanes = NoLanes;
  
  // 执行提交
  commitRootImpl(root, finishedWork, lanes);
}

function commitRootImpl(
  root: FiberRoot,
  finishedWork: Fiber,
  lanes: Lanes,
): void {
  // 提交前副作用
  commitBeforeMutationEffects(root, finishedWork, lanes);
  
  // 提交DOM变更
  commitMutationEffects(root, finishedWork, lanes);
  
  // 提交后副作用
  commitLayoutEffects(finishedWork, root, lanes);
  
  // 提交被动副作用
  commitPassiveMountEffects(root, finishedWork, lanes);
}
```

##### 5.2 提交DOM变更

```javascript
function commitMutationEffects(
  root: FiberRoot,
  finishedWork: Fiber,
  lanes: Lanes,
): void {
  // 遍历Fiber树，执行DOM变更
  recursivelyTraverseMutationEffects(root, finishedWork, lanes);
}

function commitMutationEffectsOnFiber(
  finishedWork: Fiber,
  root: FiberRoot,
  lanes: Lanes,
): void {
  const flags = finishedWork.flags;
  
  // 处理插入
  if (flags & Placement) {
    commitPlacement(finishedWork);
  }
  
  // 处理更新
  if (flags & Update) {
    commitUpdate(finishedWork);
  }
  
  // 处理删除
  if (flags & Deletion) {
    commitDeletion(finishedWork);
  }
}
```

##### 5.3 Renderer 执行副作用

```javascript
// Renderer执行DOM插入
function commitPlacement(finishedWork: Fiber): void {
  const parentFiber = getHostParentFiber(finishedWork);
  const parent = parentFiber.stateNode;
  
  const before = getHostSibling(finishedWork);
  insertOrAppendPlacementNode(finishedWork, before, parent);
}

// Renderer执行DOM更新
function commitUpdate(finishedWork: Fiber): void {
  const instance = finishedWork.stateNode;
  const newProps = finishedWork.memoizedProps;
  const oldProps = finishedWork.memoizedProps;
  
  // 更新DOM属性
  updateProperties(instance, finishedWork.type, oldProps, newProps);
}

// Renderer执行DOM删除
function commitDeletion(finishedWork: Fiber): void {
  const parentFiber = getHostParentFiber(finishedWork);
  const parent = parentFiber.stateNode;
  
  removeChild(parent, finishedWork.stateNode);
}
```

### 三大模块协作机制

#### 1. Scheduler 与 Reconciler 的协作

##### 1.1 优先级调度

```javascript
// Scheduler提供优先级API
import {
  scheduleCallback,
  shouldYield,
  getCurrentPriorityLevel,
} from 'scheduler';

// Reconciler使用Scheduler进行任务调度
function scheduleUpdateOnFiber(root: FiberRoot, fiber: Fiber, lane: Lane): void {
  const priorityLevel = getCurrentPriorityLevel();
  
  // 根据优先级创建任务
  const newTask = {
    id: taskIdCounter++,
    callback: performConcurrentWorkOnRoot.bind(null, root),
    priorityLevel,
    startTime: getCurrentTime(),
    expirationTime: computeExpirationForFiber(lane),
  };
  
  // 调度任务
  scheduleCallback(priorityLevel, newTask);
}
```

##### 1.2 时间切片

```javascript
// Scheduler检查是否需要让出控制权
function shouldYieldToHost(): boolean {
  const timeElapsed = getCurrentTime() - startTime;
  if (timeElapsed < frameInterval) {
    return false;
  }
  return true;
}

// Reconciler在工作循环中检查是否需要让出
function workLoopConcurrent(): void {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

#### 2. Reconciler 与 Renderer 的协作

##### 2.1 副作用收集与执行

```javascript
// Reconciler在渲染阶段收集副作用
function completeWork(current: Fiber | null, workInProgress: Fiber): void {
  switch (workInProgress.tag) {
    case HostComponent: {
      // 标记需要插入
      workInProgress.flags |= Placement;
      // 标记需要更新
      workInProgress.flags |= Update;
      break;
    }
  }
}

// Renderer在提交阶段执行副作用
function commitMutationEffectsOnFiber(finishedWork: Fiber): void {
  const flags = finishedWork.flags;
  
  if (flags & Placement) {
    // 执行插入操作
    commitPlacement(finishedWork);
  }
  
  if (flags & Update) {
    // 执行更新操作
    commitUpdate(finishedWork);
  }
}
```

##### 2.2 事件系统协作

```javascript
// Reconciler处理事件监听器
function updateHostComponent(current: Fiber, workInProgress: Fiber): Fiber | null {
  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  
  // 处理事件监听器
  if (nextProps.onClick) {
    workInProgress.flags |= Update;
  }
  
  return workInProgress.child;
}

// Renderer执行事件绑定
function commitUpdate(finishedWork: Fiber): void {
  const instance = finishedWork.stateNode;
  const newProps = finishedWork.memoizedProps;
  
  // 绑定事件监听器
  if (newProps.onClick) {
    addEventListener(instance, 'click', newProps.onClick);
  }
}
```

#### 3. 三大模块的协调机制

##### 3.1 更新流程

```javascript
// 1. 触发更新
setState(newState);

// 2. Reconciler创建更新
const update = createUpdate(lane);
enqueueUpdate(fiber, update, lane);

// 3. Scheduler调度任务
scheduleUpdateOnFiber(root, fiber, lane);

// 4. Reconciler执行渲染
performConcurrentWorkOnRoot(root);

// 5. Renderer执行副作用
commitRoot(root);
```

##### 3.2 错误处理协作

```javascript
// Reconciler捕获错误
function handleError(root: FiberRoot, thrownValue: mixed): void {
  // 查找错误边界
  const errorBoundary = findErrorBoundary(workInProgress);
  
  if (errorBoundary !== null) {
    // 调用错误边界
    callErrorBoundary(errorBoundary, thrownValue);
  } else {
    // 没有错误边界，交给Renderer处理
    commitRootError(root, thrownValue);
  }
}

// Renderer处理未捕获错误
function commitRootError(root: FiberRoot, thrownValue: mixed): void {
  // 显示错误UI
  showErrorUI(thrownValue);
}
```

### 性能优化机制

#### 1. 批量更新

```javascript
// Scheduler提供批量更新机制
function batchedUpdates<A, R>(fn: A => R, a: A): R {
  const prevExecutionContext = executionContext;
  executionContext |= BatchedContext;
  try {
    return fn(a);
  } finally {
    executionContext = prevExecutionContext;
    if (executionContext === NoContext) {
      flushSyncCallbacksOnlyInLegacyMode();
    }
  }
}
```

#### 2. 优先级调度

```javascript
// Scheduler根据优先级调度任务
function scheduleCallback(priorityLevel: PriorityLevel, callback: Function): Task {
  const currentTime = getCurrentTime();
  const startTime = currentTime;
  const expirationTime = startTime + timeout;
  
  const newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: expirationTime,
  };
  
  // 根据优先级加入队列
  if (expirationTime > currentTime) {
    push(taskQueue, newTask);
  } else {
    push(timerQueue, newTask);
  }
  
  return newTask;
}
```

#### 3. 早期退出

```javascript
// Reconciler实现早期退出
function bailoutOnAlreadyFinishedWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  // 检查是否有更新
  if (!includesSomeLane(renderLanes, workInProgress.childLanes)) {
    // 没有更新，直接复用
    return null;
  }
  
  // 克隆子Fiber
  cloneChildFibers(current, workInProgress);
  return workInProgress.child;
}
```

### 面试重点

#### 1. 三大模块的作用

- **Scheduler**: 任务调度、优先级管理、时间切片
- **Reconciler**: 虚拟 DOM diff、Fiber 树构建、副作用收集
- **Renderer**: 平台特定渲染、副作用执行、事件处理

#### 2. 协作机制

- **Scheduler与Reconciler**: 优先级调度、时间切片、让出控制权
- **Reconciler与Renderer**: 副作用收集与执行、事件系统协作
- **三大模块协调**: 更新流程、错误处理、性能优化

#### 3. 工作流程

- **触发更新**: 用户交互或程序触发
- **创建更新**: Reconciler 创建更新对象
- **调度更新**: Scheduler 根据优先级调度
- **渲染阶段**: Reconciler 执行虚拟DOM diff
- **提交阶段**: Renderer 执行副作用

#### 4. 性能优化

- **批量更新**: 减少渲染次数
- **优先级调度**: 优先处理重要任务
- **时间切片**: 避免阻塞主线程
- **早期退出**: 避免不必要的计算

#### 5. 错误处理

- **错误边界**: 捕获组件错误
- **错误恢复**: 显示错误 UI
- **错误传播**: 向上传播未处理错误
