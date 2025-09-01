# React源码学习路线图

## 📚 学习路线

### 第一阶段：基础架构理解

#### 1. React整体架构 ⭐⭐⭐⭐⭐ (重点)

- React三大核心模块：Reconciler、Renderer、Scheduler
- 各模块职责和协作关系
- 源码目录结构分析

**重点文件**:

```text
packages/
├── react/                    # React核心API
├── react-reconciler/        # 协调器核心 ⭐⭐⭐⭐⭐
├── react-dom/               # DOM渲染器
├── scheduler/               # 调度器 ⭐⭐⭐⭐⭐
└── shared/                  # 共享工具
```

**重点**:

- React 18的并发特性
- Fiber架构的设计理念
- 调度器的工作原理

#### 2. Fiber架构 ⭐⭐⭐⭐⭐ (重点)

**学习内容**:

- Fiber节点的数据结构
- Fiber树的双缓存机制
- 工作循环(Work Loop)机制

**核心文件**:

```text
packages/react-reconciler/src/
├── ReactFiber.js           # Fiber节点定义 ⭐⭐⭐⭐⭐
├── ReactFiberWorkLoop.js   # 工作循环 ⭐⭐⭐⭐⭐
├── ReactFiberBeginWork.js  # 开始工作
└── ReactFiberCompleteWork.js # 完成工作
```

**重点**:

- Fiber节点的属性含义
- 双缓存树的作用
- 工作循环的执行流程

### 第二阶段：核心机制深入

#### 3. 调度系统 ⭐⭐⭐⭐⭐ (重点)

- 优先级系统(Lane模型)
- 调度算法
- 时间切片(Time Slicing)

**核心文件**:

```text
packages/react-reconciler/src/
├── ReactFiberLane.js       # 优先级系统 ⭐⭐⭐⭐⭐
├── ReactFiberScheduler.js  # 调度器
└── packages/scheduler/      # 独立调度器 ⭐⭐⭐⭐⭐
```

**重点**:

- Lane优先级模型
- 调度器的调度策略
- 时间切片的实现

#### 4. 更新机制 ⭐⭐⭐⭐⭐ (重点)

- 更新队列(Update Queue)
- 批量更新机制
- 状态更新流程

**核心文件**:

```text
packages/react-reconciler/src/
├── ReactFiberConcurrentUpdates.js # 并发更新 ⭐⭐⭐⭐⭐
├── ReactFiberClassUpdateQueue.js  # 类组件更新队列
└── ReactFiberHooks.js            # Hooks更新机制 ⭐⭐⭐⭐⭐
```

**重点**:

- 更新队列的数据结构
- 批量更新的实现原理
- 状态更新的完整流程

#### 5. Hooks系统 ⭐⭐⭐⭐⭐ (重点)

- Hooks的数据结构
- Hooks的调用顺序保证
- 各种Hooks的实现原理

**核心文件**:

```text
packages/react-reconciler/src/
├── ReactFiberHooks.js      # Hooks核心实现 ⭐⭐⭐⭐⭐
├── ReactFiberNewContext.js # Context实现
└── ReactFiberCacheComponent.js # Cache实现
```

**重点**:

- Hooks的链表结构
- useState/useEffect的实现
- Hooks调用顺序的保证机制

### 第三阶段：渲染机制

#### 6. 渲染流程 ⭐⭐⭐⭐

- 渲染阶段(Render Phase)
- 提交阶段(Commit Phase)
- 副作用处理

**核心文件**:

```text
packages/react-reconciler/src/
├── ReactFiberWorkLoop.js   # 工作循环 ⭐⭐⭐⭐
├── ReactFiberBeginWork.js  # 开始工作
├── ReactFiberCompleteWork.js # 完成工作
└── ReactFiberCommitWork.js # 提交工作 ⭐⭐⭐⭐
```

#### 7. DOM操作 ⭐⭐⭐⭐

- DOM Diff算法
- DOM 操作优化
- 事件系统

**核心文件**:

```text
packages/react-dom/src/
├── ReactDOMComponent.js    # DOM组件 ⭐⭐⭐⭐
├── ReactDOMHostConfig.js   # 主机配置
└── events/                 # 事件系统 ⭐⭐⭐⭐
```

### 第四阶段：高级特性

#### 8. 并发特性 ⭐⭐⭐⭐⭐ (重点)

- Concurrent Mode
- Suspense机制
- Transition API

**核心文件**:

```text
packages/react-reconciler/src/
├── ReactFiberLane.js       # 优先级 ⭐⭐⭐⭐⭐
├── ReactFiberSuspenseComponent.js # Suspense ⭐⭐⭐⭐
└── ReactFiberTransition.js # Transition ⭐⭐⭐⭐
```

**重点**:

- Concurrent Mode的工作原理
- Suspense的数据获取机制
- Transition API的使用场景

#### 9. 错误边界 ⭐⭐⭐

- 错误边界的实现
- 错误处理机制

#### 10. 性能优化 ⭐⭐⭐⭐

**学习内容**:

- React.memo的实现
- useMemo/useCallback优化
- 虚拟化列表

## 🎯 重点标记

### ⭐⭐⭐⭐⭐ 必考内容

1. **Fiber架构** - 理解Fiber的设计理念和数据结构
2. **调度系统** - 掌握Lane模型和调度算法
3. **Hooks机制** - 深入理解Hooks的实现原理
4. **并发特性** - React 18的新特性
5. **更新机制** - 状态更新的完整流程

### ⭐⭐⭐⭐ 高频考点

1. **渲染流程** - Render Phase和Commit Phase
2. **DOM Diff** - 虚拟DOM的Diff算法
3. **事件系统** - React事件的处理机制
4. **性能优化** - React的性能优化策略
