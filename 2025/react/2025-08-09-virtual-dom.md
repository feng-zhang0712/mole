# React 的虚拟 DOM

## 一、介绍

> 本文档的所有分析及源码，基于 React v19.1.1 版本。

虚拟 DOM（Virtual DOM）是真实 DOM 的 JavaScript 对象表示。虚拟 DOM 提供了一种声明式的编程模型，在内存中保存 UI 的"理想状态"，并通过协调过程与真实 DOM 保持同步。

虚拟 DOM 的核心理念，可以用一个公式来表示。

```javascript
UI = f(state)
```

上面代码中，`UI` 指用户界面，`f` 是渲染函数，`state` 是应用状态。当状态变化时，React 创建新的虚拟 DOM 树，通过 diff 算法，与之前的虚拟 DOM 树进行比较，从而找出最小变更集，最后将变更应用到真实 DOM。

虚拟 DOM 的优势，主要体现在两个方面，一是**通过 diff 算法减少真实 DOM 操作次数**，二是**批量更新机制合并多次更新操作**。因此，虚拟 DOM 适合大量数据的部分更新和复杂 UI 状态管理的场景。由于要执行额外的 diff 算法，所以不适合简单静态内容和频繁的全量更新的场景。

虚拟 DOM 有四个特点。

- 性能优化：通过 diff 算法减少 DOM 操作次数，批量更新机制将多次更新合并为一次执行。
- 轻量级对象：虚拟 DOM 对象比真实的 DOM 节点更轻量。
- 声明式编程：虚拟 DOM 的引入使的声明式编程变成可能。
- 跨平台抽象：虚拟 DOM 提供了一层抽象，使 React 能够渲染到不同平台。

真实 DOM，就是浏览器中渲染的真实的 DOM 节点，这个节点也是一个对象，将这个对象打印出来，就会发现，对象中保存着很多属性和方法，这使得真实 DOM 变得臃肿。

```javascript
document.createElement('div');

/*
{
  nodeType: 1,
  nodeName: "DIV",
  tagName: "DIV",
  outerHTML: "<div></div>",
  // ...
}
*/
```

上面是 `div` 节点打印出来的样子，除了上面的四个属性，还有几十个其他的属性和方法。

下面是 React 中的虚拟 DOM 结构，可以看出，虚拟 DOM 中只有五个属性，这使得 DOM 对象变得更轻量。

```javascript
export type ReactElement = {
  $$typeof: any,
  type: any,
  key: any,
  ref: any,
  props: any,
};
```

除了上面的五个属性，`ReactElement` 对象中还有五个其他属性，只不过他们只用于开发环境或者在调试时使用，所以没有列出。

下面是这六个属性的含义。

- `$$typeof` 用于区分 React 元素与其他普通 JavaScript 对象，可以验证传入的对象是否为有效的 React 元素。这是一个 Symbol 类型的值，可以防止恶意 JSON 注入，预防 XSS 攻击，确保只有 React 创建的元素才能被渲染。

  下面列出了几种常见组件及其对应的 `$$typeof` 值。

  ```javascript
  export const REACT_LEGACY_ELEMENT_TYPE: symbol = Symbol.for('react.element');
  export const REACT_ELEMENT_TYPE: symbol = renameElementSymbol
    ? Symbol.for('react.transitional.element')
    : REACT_LEGACY_ELEMENT_TYPE;
  export const REACT_PORTAL_TYPE: symbol = Symbol.for('react.portal');
  export const REACT_FRAGMENT_TYPE: symbol = Symbol.for('react.fragment');
  export const REACT_STRICT_MODE_TYPE: symbol = Symbol.for('react.strict_mode');
  export const REACT_CONTEXT_TYPE: symbol = Symbol.for('react.context');
  ```

  React 中 `isValidElement()` 方法就用到了 `$$typeof` 字段，用来判断某个对象是否是合法的 `ReactElement` 对象。

  ```javascript
  export function isValidElement(object) {
    return (
      typeof object === 'object' &&
      object !== null &&
      object.$$typeof === REACT_ELEMENT_TYPE
    );
  }
  ```

- `type` 字段表示元素的类型。

  - 函数组件或类组件，值为组件本身。比如，`MyComponent`。
  - 对于原生 DOM 元素，`type` 值为元素对应的名称。比如，`"div"`、`"span"` 等。
  - 对于特殊 React 类型，比如 Fragment 或者 Suspense，`type` 是一个 Symbol 类型的值。

- `key` 是 React 用于标识列表中元素的字段，通常为字符串或数字。该字段主要用于 diff 算法，用来识别哪些元素发生了变化，从而避免不必要的 DOM 操作。
- `ref` 字段用于获取 DOM 节点或组件实例的引用。
- `props` 字段包含传递给组件的所有属性，包括 `children`。

下面是一个函数组件生成 ReactElement 对象的例子。

```jsx
function Component(props) {
  return <div>{props.text}</div>;
}

const element = React.createElement(Component, {
  text: "Hello",
});

// 实际生成的 ReactElement 对象
{
  $$typeof: Symbol.for('react.element'),
  type: Component,
  key: null,
  ref: null,
  props: {
    text: "Hello"
  }
}
```

下面是一个原生 DOM 组件生成 ReactElement 对象的例子。

```jsx
const element = React.createElement(
  'div',
  { 
    className: 'container',
    onClick: () => console.log('clicked')
  },
  'Hello World'
);

// 实际生成的 ReactElement 对象
{
  $$typeof: Symbol.for('react.element'),
  type: 'div',  // 字符串类型
  key: null,
  ref: null,
  props: {
    className: 'container',
    onClick: () => console.log('clicked'),
    children: 'Hello World'
  }
}
```

下面是一个更复杂的例子。

```jsx
const JSXElement = (
  <div className="app">
    <header key="header" className="app-header">
      <h1>My App</h1>
    </header>
    <main key="main" className="app-main">
      <Navigation key="nav" items={['Home', 'About', 'Contact']} />
      <div key="content" className="content">
        <ArticleList key="articles" articles={[]} />
      </div>
    </main>
  </div>
);

// 实际生成的 ReactElement 对象
{
  $$typeof: REACT_ELEMENT_TYPE,
  type: 'div',
  props: {
    className: 'app',
    children: [
      {
        $$typeof: REACT_ELEMENT_TYPE,
        type: 'header',
        key: 'header',
        props: {
          children: [
            {
              $$typeof: REACT_ELEMENT_TYPE,
              type: 'h1',
              props: { children: 'My App' }
            },
            {
              $$typeof: REACT_ELEMENT_TYPE,
              type: 'p',
              props: { children: '真是一个 React 虚拟 DOM 的示例' }
            }
          ]
        }
      },
      {
        $$typeof: REACT_ELEMENT_TYPE,
        type: 'main',
        key: 'main',
        props: {
          children: {
            $$typeof: REACT_ELEMENT_TYPE,
            type: ArticleList,
            props: { articles: [] }
          }
        }
      }
    ]
  }
}
```

注意，上面代码中没有列出值为空的属性。

## 二、虚拟 DOM 的创建过程

### 2.1 ReactElement 的创建

在 React 的 JSX 运行时模块出现以前，JSX 语法到到虚拟 DOM 的转换，通过 Babel 的 `React.createElement()` 方法进行。

```javascript
// .babelrc
plugins: [
  '@babel/plugin-syntax-jsx',
  '@babel/plugin-transform-react-jsx',
  // ...
]
```

React 新版中这一过程使用 React `jsx-runtime` 运行时模块中的 `jsx()`（生产环境使用 `jsx-dev-runtime` 模块的 `jsxDEV()`）方法执行。

```javascript
// `packages/react/src/jsx/`

export function jsxProd(type, config, maybeKey) {
  // 处理 `key` 属性
  let key = null;
  if (maybeKey !== undefined) {
    key = '' + maybeKey;
  }
  if (hasValidKey(config)) {
    key = '' + config.key;
  }

  // 将除 `key` 之外的其他属性，挂载到 `props` 对象中
  let props;
  if (!('key' in config)) {
    props = config;
  } else {
    props = {};
    for (const propName in config) {
      if (propName !== 'key') {
        props[propName] = config[propName];
      }
    }
  }

  // 如果设置了默认属性 `defaultProps`，则处理对应的默认属性值
  if (!disableDefaultPropsExceptForClasses) {
    if (type && type.defaultProps) {
      const defaultProps = type.defaultProps;
      for (const propName in defaultProps) {
        if (props[propName] === undefined) {
          props[propName] = defaultProps[propName];
        }
      }
    }
  }

  // 调用 `ReactElement` 构造函数，创建 ReactElement 对象
  return ReactElement(
    type,
    key,
    undefined,
    undefined,
    getOwner(),
    props,
    undefined,
    undefined,
  );
}

function ReactElement(
  type,
  key,
  self,
  source,
  owner,
  props,
  debugStack,
  debugTask,
) {
  const refProp = props.ref;
  const ref = refProp !== undefined ? refProp : null;

  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props,
  };
}
```

### 2.2 从 ReactElement 到 Fiber 节点

当 React 开始渲染时，ReactElement 被转换为 Fiber 节点。这个过程发生在协调（Reconciliation）阶段。

```javascript
export function createFiberFromElement(
  element: ReactElement,
  mode: TypeOfMode,
  lanes: Lanes,
): Fiber {
  const { type, key, props } = element;
  
  let fiberTag = FunctionComponent;
  if (typeof type === 'function') {
    if (shouldConstruct(type)) {
      fiberTag = ClassComponent;
    }
  } else if (typeof type === 'string') {
    fiberTag = HostComponent;
  } else {
    // 处理其他类型的 ReactElement
    // ...
  }

  const fiber = createFiber(fiberTag, props, key, mode);
  fiber.elementType = type;
  fiber.type = type;
  fiber.lanes = lanes;

  return fiber;
}
```

## 1. 整体架构概览

React 的渲染过程主要分为两个阶段。

- Render 阶段（协调阶段）构建 Fiber 树，确定需要执行的副作用。
- Commit 阶段（提交阶段）将副作用应用到真实 DOM。

整个流程由 React Reconciler（协调器）和 React DOM Renderer（渲染器）协同完成。

## 2. 渲染流程的入口

```javascript
// 渲染入口
// react/packages/react-dom/src/client/ReactDOMRoot.js
ReactDOMRoot.prototype.render = function (children: ReactNodeList): void {
  const root = this._internalRoot;
  if (root === null) {
    throw new Error('Cannot update an unmounted root.');
  }
  // 调用 updateContainer 开始更新流程
  updateContainer(children, root, null, null);
};
```

当调用 `root.render()` 时，会触发 `updateContainer` 函数，这是整个渲染流程的起点。

## 3. Render 阶段（协调阶段）

### 3.1 工作循环调度

```javascript
// 工作循环
// react/packages/react-reconciler/src/ReactFiberWorkLoop.js
function performWorkOnRoot(
  root: FiberRoot,
  lanes: Lanes,
  forceSync: boolean,
): void {
  // 根据优先级决定是否进行时间切片
  const shouldTimeSlice =
    (!forceSync &&
      !includesBlockingLane(lanes) &&
      !includesExpiredLane(root, lanes)) ||
    (enableSiblingPrerendering && checkIfRootIsPrerendering(root, lanes));

  let exitStatus = shouldTimeSlice
    ? renderRootConcurrent(root, lanes)  // 并发渲染
    : renderRootSync(root, lanes, true); // 同步渲染
}
```

`performWorkOnRoot` 是工作循环的核心，它根据更新优先级决定使用并发渲染还是同步渲染。

### 3.2 同步渲染流程

```javascript
// 同步渲染
// react/packages/react-reconciler/src/ReactFiberWorkLoop.js
function renderRootSync(
  root: FiberRoot,
  lanes: Lanes,
  shouldYieldForPrerendering: boolean,
): RootExitStatus {
  const prevExecutionContext = executionContext;
  executionContext |= RenderContext;
  
  // 准备新的工作栈
  if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) {
    prepareFreshStack(root, lanes);
  }
  
  // 执行工作循环
  do {
    try {
      workLoopSync();
    } catch (value) {
      // 错误处理
    }
  } while (true);
}
```

同步渲染会直接执行 `workLoopSync`，不会让出控制权。

### 3.3 工作单元处理

```javascript
// 工作单元处理
// react/packages/react-reconciler/src/ReactFiberWorkLoop.js
function workLoopSync() {
  // 持续处理工作单元，直到没有更多工作
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork: Fiber): void {
  const current = unitOfWork.alternate;
  
  // 开始工作：处理当前 Fiber 节点
  let next = beginWork(current, unitOfWork, entangledRenderLanes);
  
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  
  if (next === null) {
    // 如果没有子节点，完成当前工作单元
    completeUnitOfWork(unitOfWork);
  } else {
    // 继续处理下一个子节点
    workInProgress = next;
  }
}
```

每个工作单元的处理分为两个阶段：

- `beginWork`：处理 Fiber 节点，生成子节点
- `completeWork`：完成 Fiber 节点的处理

### 3.4 beginWork 阶段

```javascript
// 开始工作
// react/packages/react-reconciler/src/ReactFiberBeginWork.js
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  // 检查是否需要更新
  if (current !== null) {
    const oldProps = current.memoizedProps;
    const newProps = workInProgress.pendingProps;
    
    if (oldProps !== newProps || hasLegacyContextChanged()) {
      didReceiveUpdate = true;
    } else {
      // 尝试提前退出
      const hasScheduledUpdateOrContext = checkScheduledUpdateOrContext(
        current,
        renderLanes,
      );
      if (!hasScheduledUpdateOrContext) {
        return attemptEarlyBailoutIfNoScheduledUpdate(
          current,
          workInProgress,
          renderLanes,
        );
      }
    }
  }
  
  // 根据 Fiber 类型执行相应的更新逻辑
  switch (workInProgress.tag) {
    case FunctionComponent:
      return updateFunctionComponent(current, workInProgress, Component, resolvedProps, renderLanes);
    case ClassComponent:
      return updateClassComponent(current, workInProgress, Component, resolvedProps, renderLanes);
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes);
    case HostText:
      return updateHostText(current, workInProgress);
    // ... 其他类型
  }
}
```

`beginWork` 会根据 Fiber 节点的类型执行相应的更新逻辑，对于 HostComponent（原生 DOM 元素），会调用 `updateHostComponent`。

### 3.5 各类型组件的更新流程

#### 3.5.1 updateFunctionComponent 流程

```javascript
// 函数组件更新
// react/packages/react-reconciler/src/ReactFiberBeginWork.js
function updateFunctionComponent(
  current: null | Fiber,
  workInProgress: Fiber,
  Component: any,
  nextProps: any,
  renderLanes: Lanes,
) {
  // 处理 Context
  let context;
  if (!disableLegacyContext && !disableLegacyContextForFunctionComponents) {
    const unmaskedContext = getUnmaskedContext(workInProgress, Component, true);
    context = getMaskedContext(workInProgress, unmaskedContext);
  }

  // 执行函数组件，获取子节点
  let nextChildren;
  prepareToReadContext(workInProgress, renderLanes);
  nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component,
    nextProps,
    context,
    renderLanes,
  );

  // 如果组件没有更新，尝试提前退出
  if (current !== null && !didReceiveUpdate) {
    bailoutHooks(current, workInProgress, renderLanes);
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }

  // 标记工作已完成
  workInProgress.flags |= PerformedWork;
  
  // 协调子节点
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
```

`updateFunctionComponent` 的核心步骤：

1. **处理 Context**：获取组件需要的上下文
2. **执行组件**：调用 `renderWithHooks` 执行函数组件，获取返回的 JSX
3. **提前退出检查**：如果组件没有更新，尝试跳过后续处理
4. **协调子节点**：调用 `reconcileChildren` 处理子节点

#### 3.5.2 updateClassComponent 流程

```javascript
// 类组件更新
// react/packages/react-reconciler/src/ReactFiberBeginWork.js
function updateClassComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  nextProps: any,
  renderLanes: Lanes,
) {
  const instance = workInProgress.stateNode;
  let shouldUpdate;
  
  if (instance === null) {
    // 首次渲染：构造实例并挂载
    constructClassInstance(workInProgress, Component, nextProps);
    mountClassInstance(workInProgress, Component, nextProps, renderLanes);
    shouldUpdate = true;
  } else if (current === null) {
    // 恢复挂载：复用现有实例
    shouldUpdate = resumeMountClassInstance(
      workInProgress,
      Component,
      nextProps,
      renderLanes,
    );
  } else {
    // 更新：处理 props、state、生命周期
    shouldUpdate = updateClassInstance(
      current,
      workInProgress,
      Component,
      nextProps,
      renderLanes,
    );
  }
  
  // 完成类组件处理
  const nextUnitOfWork = finishClassComponent(
    current,
    workInProgress,
    Component,
    shouldUpdate,
    hasContext,
    renderLanes,
  );
  
  return nextUnitOfWork;
}
```

`updateClassComponent` 的核心步骤：

1. **实例管理**：根据是否存在实例决定是构造、恢复还是更新
2. **生命周期处理**：调用相应的生命周期方法
3. **状态更新**：处理 props 和 state 的变化
4. **渲染决策**：通过 `shouldComponentUpdate` 等方法决定是否需要重新渲染

#### 3.5.3 updateHostComponent 流程

```javascript
// 原生 DOM 组件更新
// react/packages/react-reconciler/src/ReactFiberBeginWork.js
function updateHostComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
) {
  // 处理水合
  if (current === null) {
    tryToClaimNextHydratableInstance(workInProgress);
  }

  // 推送主机上下文
  pushHostContext(workInProgress);

  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  const prevProps = current !== null ? current.memoizedProps : null;

  let nextChildren = nextProps.children;
  const isDirectTextChild = shouldSetTextContent(type, nextProps);

  if (isDirectTextChild) {
    // 直接文本子节点：特殊处理，避免创建额外的 Fiber
    nextChildren = null;
  } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
    // 从直接文本切换到普通子节点：标记内容重置
    workInProgress.flags |= ContentReset;
  }

  // 协调子节点
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
```

`updateHostComponent` 的核心步骤：

1. **水合处理**：在服务端渲染时尝试复用现有 DOM 节点
2. **上下文管理**：推送主机上下文（如 SVG 命名空间）
3. **文本优化**：对于直接文本子节点进行特殊处理
4. **子节点协调**：处理子节点的变化

### 3.6 reconcileChildren 协调算法

```javascript
// 协调子节点
// react/packages/react-reconciler/src/ReactFiberBeginWork.js
export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderLanes: Lanes,
) {
  if (current === null) {
    // 首次渲染：挂载子节点
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes,
    );
  } else {
    // 更新：协调子节点
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderLanes,
    );
  }
}
```

`reconcileChildren` 是 React 协调算法的核心，它：

1. **区分挂载和更新**：首次渲染使用 `mountChildFibers`，更新使用 `reconcileChildFibers`
2. **执行 Diff 算法**：比较新旧子节点，确定需要执行的 DOM 操作
3. **生成副作用标记**：标记需要创建、更新、删除的节点

#### 3.6.1 协调算法的核心逻辑

```javascript
// 协调子节点实现
// react/packages/react-reconciler/src/ReactChildFiber.js
function reconcileChildFibersImpl(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChild: any,
  lanes: Lanes,
): Fiber | null {
  // 处理不同类型的子节点
  if (typeof newChild === 'object' && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE:
        return reconcileSingleElement(returnFiber, currentFirstChild, newChild, lanes);
      case REACT_PORTAL_TYPE:
        return reconcileSinglePortal(returnFiber, currentFirstChild, newChild, lanes);
    }

    if (isArray(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, lanes);
    }
  }

  if (typeof newChild === 'string' || typeof newChild === 'number') {
    return reconcileSingleTextNode(returnFiber, currentFirstChild, '' + newChild, lanes);
  }

  // 删除剩余的子节点
  return deleteRemainingChildren(returnFiber, currentFirstChild);
}
```

协调算法会根据子节点的类型执行不同的处理：

- **单个元素**：`reconcileSingleElement`
- **数组**：`reconcileChildrenArray`（最复杂的 Diff 算法）
- **文本**：`reconcileSingleTextNode`
- **Portal**：`reconcileSinglePortal`

### 3.7 工作单元完成处理

当 `beginWork` 返回 `null` 时，表示当前节点没有子节点，需要调用 `completeWork` 完成当前工作单元：

```javascript
// 完成工作单元
// react/packages/react-reconciler/src/ReactFiberWorkLoop.js
function completeUnitOfWork(unitOfWork: Fiber): void {
  let completedWork = unitOfWork;
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;

    // 完成当前工作单元
    completeWork(current, completedWork, entangledRenderLanes);

    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      // 如果有兄弟节点，处理兄弟节点
      workInProgress = siblingFiber;
      return;
    }
    
    // 继续处理父节点
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);
}
```

`completeUnitOfWork` 会：

1. **完成当前节点**：调用 `completeWork` 处理当前 Fiber 节点
2. **处理兄弟节点**：如果有兄弟节点，切换到兄弟节点
3. **向上回溯**：如果没有兄弟节点，向上处理父节点

### 3.8 completeWork 阶段

```javascript
// 完成工作
// react/packages/react-reconciler/src/ReactFiberCompleteWork.js
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  const newProps = workInProgress.pendingProps;
  
  switch (workInProgress.tag) {
    case HostComponent: {
      const type = workInProgress.type;
      
      if (current !== null && workInProgress.stateNode != null) {
        // 更新现有实例
        updateHostComponent(current, workInProgress, renderLanes);
      } else {
        // 创建新实例
        const currentHostContext = getHostContext();
        const wasHydrated = popHydrationState(workInProgress);
        
        if (wasHydrated) {
          // 水合模式：准备现有实例
          prepareToHydrateHostInstance(workInProgress, currentHostContext);
        } else {
          // 客户端渲染：创建新实例
          const rootContainerInstance = getRootHostContainer();
          const instance = createInstance(
            type,
            newProps,
            rootContainerInstance,
            currentHostContext,
            workInProgress,
          );
          
          // 将子节点添加到实例
          appendAllChildren(instance, workInProgress, false, false);
          workInProgress.stateNode = instance;
          
          // 设置初始属性
          if (finalizeInitialChildren(instance, type, newProps, currentHostContext)) {
            markUpdate(workInProgress);
          }
        }
      }
      break;
    }
    case HostText: {
      const newText = newProps;
      if (current && workInProgress.stateNode != null) {
        // 更新现有文本节点
        updateHostText(current, workInProgress, oldText, newText);
      } else {
        // 创建新文本节点
        const rootContainerInstance = getRootHostContainer();
        const currentHostContext = getHostContext();
        const wasHydrated = popHydrationState(workInProgress);
        
        if (wasHydrated) {
          prepareToHydrateHostTextInstance(workInProgress);
        } else {
          workInProgress.stateNode = createTextInstance(
            newText,
            rootContainerInstance,
            currentHostContext,
            workInProgress,
          );
        }
      }
      break;
    }
  }
  
  // 冒泡属性到父节点
  bubbleProperties(workInProgress);
  return null;
}
```

`completeWork` 阶段负责：

1. 创建或更新 DOM 实例
2. 设置 DOM 属性
3. 将子节点添加到父节点
4. 冒泡副作用标志

## 4. DOM 实例的创建

### 4.1 创建 DOM 元素

```javascript
// 创建 DOM 实例
// react/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js
export function createInstance(
  type: string,
  props: Props,
  rootContainerInstance: Container,
  hostContext: HostContext,
  internalInstanceHandle: Object,
): Instance {
  const ownerDocument = getOwnerDocumentFromRootContainer(rootContainerInstance);
  
  let domElement: Instance;
  
  // 根据类型和命名空间创建相应的 DOM 元素
  switch (hostContextProd) {
    case HostContextNamespaceSvg:
      domElement = ownerDocument.createElementNS(SVG_NAMESPACE, type);
      break;
    case HostContextNamespaceMath:
      domElement = ownerDocument.createElementNS(MATH_NAMESPACE, type);
      break;
    default:
      switch (type) {
        case 'svg':
          domElement = ownerDocument.createElementNS(SVG_NAMESPACE, type);
          break;
        case 'script':
          // 特殊处理 script 标签
          const div = ownerDocument.createElement('div');
          div.innerHTML = '<script><' + '/script>';
          const firstChild = div.firstChild;
          domElement = div.removeChild(firstChild);
          break;
        default:
          if (typeof props.is === 'string') {
            domElement = ownerDocument.createElement(type, {is: props.is});
          } else {
            domElement = ownerDocument.createElement(type);
          }
      }
  }
  
  // 缓存 Fiber 节点引用和属性
  precacheFiberNode(internalInstanceHandle, domElement);
  updateFiberProps(domElement, props);
  
  return domElement;
}
```

`createInstance` 会根据元素类型和命名空间创建相应的 DOM 元素，并建立 Fiber 节点与 DOM 元素的关联。

### 4.2 创建文本节点

```javascript
// 创建文本实例
// react/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js
export function createTextInstance(
  text: string,
  rootContainerInstance: Container,
  hostContext: HostContext,
  internalInstanceHandle: Object,
): TextInstance {
  const ownerDocument = getOwnerDocumentFromRootContainer(rootContainerInstance);
  const textNode = ownerDocument.createTextNode(text);
  
  // 缓存 Fiber 节点引用
  precacheFiberNode(internalInstanceHandle, textNode);
  
  return textNode;
}
```

文本节点的创建相对简单，直接调用 `createTextNode` 方法。

### 4.3 设置初始属性

```javascript
// 设置初始属性
// react/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js
export function finalizeInitialChildren(
  domElement: Instance,
  type: string,
  props: Props,
  hostContext: HostContext,
): boolean {
  // 设置 DOM 属性
  setInitialProperties(domElement, type, props);
  
  // 根据类型决定是否需要特殊处理
  switch (type) {
    case 'button':
    case 'input':
    case 'select':
    case 'textarea':
      return !!props.autoFocus; // 返回是否需要自动聚焦
    case 'img':
      return true; // 图片总是需要特殊处理
    default:
      return false;
  }
}
```

`finalizeInitialChildren` 负责设置 DOM 元素的初始属性，并返回是否需要额外的处理（如自动聚焦）。

## 5. Commit 阶段（提交阶段）

### 5.1 提交根节点

```javascript
// 提交根节点
// react/packages/react-reconciler/src/ReactFiberWorkLoop.js
function commitRoot(
  root: FiberRoot,
  finishedWork: null | Fiber,
  lanes: Lanes,
  // ... 其他参数
): void {
  // 处理被动效果
  do {
    flushPendingEffects();
  } while (pendingEffectsStatus !== NO_PENDING_EFFECTS);
  
  // 标记提交开始
  if (enableSchedulingProfiler) {
    markCommitStarted(lanes);
  }
  
  if (finishedWork === null) {
    return;
  }
  
  // 标记根节点完成
  markRootFinished(root, lanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes);
  
  // 重置工作进度
  if (root === workInProgressRoot) {
    workInProgressRoot = null;
    workInProgress = null;
    workInProgressRootRenderLanes = NoLanes;
  }
  
  // 提交副作用
  commitRootImpl(finishedWork, root, lanes);
}
```

`commitRoot` 是提交阶段的入口，负责协调整个提交过程。

### 5.2 提交副作用

```javascript
// 提交副作用
// react/packages/react-reconciler/src/ReactFiberCommitWork.js
export function commitMutationEffects(
  root: FiberRoot,
  finishedWork: Fiber,
  committedLanes: Lanes,
) {
  inProgressLanes = committedLanes;
  inProgressRoot = root;
  
  resetComponentEffectTimers();
  
  // 递归处理所有 Fiber 节点的副作用
  commitMutationEffectsOnFiber(finishedWork, root, committedLanes);
  
  inProgressLanes = null;
  inProgressRoot = null;
}
```

`commitMutationEffects` 负责处理所有需要 DOM 变更的副作用。

### 5.3 处理 HostComponent 的副作用

```javascript
// ReactFiberCommitWork.js - 处理HostComponent副作用
case HostComponent: {
  recursivelyTraverseMutationEffects(root, finishedWork, lanes);
  commitReconciliationEffects(finishedWork, lanes);
  
  if (flags & Ref) {
    // 处理ref
    if (!offscreenSubtreeWasHidden && current !== null) {
      safelyDetachRef(current, current.return);
    }
  }
  
  if (supportsMutation) {
    // 处理内容重置
    if (finishedWork.flags & ContentReset) {
      commitHostResetTextContent(finishedWork);
    }
    
    // 处理更新
    if (flags & Update) {
      const instance: Instance = finishedWork.stateNode;
      if (instance != null) {
        const newProps = finishedWork.memoizedProps;
        const oldProps = current !== null ? current.memoizedProps : newProps;
        commitHostUpdate(finishedWork, newProps, oldProps);
      }
    }
  }
  break;
}
```

对于 HostComponent，主要处理：

1. **Ref副作用**：安全地分离旧的 ref 引用
2. **内容重置**：重置文本内容
3. **属性更新**：应用新的属性到 DOM 元素

### 5.4 处理 HostText 的副作用

```javascript
// ReactFiberCommitWork.js - 处理HostText副作用
case HostText: {
  recursivelyTraverseMutationEffects(root, finishedWork, lanes);
  commitReconciliationEffects(finishedWork, lanes);
  
  if (flags & Update) {
    if (supportsMutation) {
      if (finishedWork.stateNode === null) {
        throw new Error('This should have a text node initialized.');
      }
      
      const newText: string = finishedWork.memoizedProps;
      const oldText: string = current !== null ? current.memoizedProps : newText;
      
      // 提交文本更新
      commitHostTextUpdate(finishedWork, newText, oldText);
    }
  }
  break;
}
```

文本节点的更新相对简单，直接调用`commitHostTextUpdate`更新文本内容。

## 6. DOM操作的具体实现

### 6.1 属性更新

```javascript
// ReactDOMComponent.js - 更新属性
export function updateProperties(
  domElement: Element,
  updatePayload: Array<mixed>,
  tag: string,
  lastRawProps: Object,
  nextRawProps: Object,
): void {
  // 应用更新载荷
  if (updatePayload.length) {
    updateDOMProperties(domElement, updatePayload, tag, lastRawProps, nextRawProps);
  }
  
  // 处理特殊属性
  updateDOMProperties(domElement, updatePayload, tag, lastRawProps, nextRawProps);
}
```

属性更新通过`updateProperties`函数实现，它会：

1. 应用更新载荷（updatePayload）
2. 处理特殊属性（如事件监听器、样式等）

### 6.2 文本内容更新

```javascript
// ReactFiberConfigDOM.js - 更新文本内容
export function commitHostTextUpdate(
  finishedWork: Fiber,
  newText: string,
  oldText: string,
): void {
  const textInstance: TextInstance = finishedWork.stateNode;
  
  if (newText !== oldText) {
    // 直接更新文本节点的内容
    textInstance.nodeValue = newText;
  }
}
```

文本更新通过直接修改`nodeValue`属性实现，这是最高效的文本更新方式。

### 6.3 子节点操作

```javascript
// ReactFiberConfigDOM.js - 添加子节点
export function appendInitialChild(
  parentInstance: Instance,
  child: Instance | TextInstance,
): void {
  // 注意：这里不使用 moveBefore，因为初始子节点是在断开连接时添加的
  parentInstance.appendChild(child);
}

// ReactFiberConfigDOM.js - 插入子节点
export function insertInContainerBefore(
  container: Container,
  child: Instance | TextInstance,
  beforeChild: Instance | TextInstance,
): void {
  container.insertBefore(child, beforeChild);
}

// ReactFiberConfigDOM.js - 移除子节点
export function removeChild(
  parentInstance: Instance,
  child: Instance | TextInstance,
): void {
  parentInstance.removeChild(child);
}
```

子节点的操作包括：

- **appendChild**：添加子节点到末尾
- **insertBefore**：在指定节点前插入
- **removeChild**：移除子节点

## 三、diff 算法

下面是 diff 算法完整的执行流程。

```javascript
function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderLanes: Lanes,
) {
  if (current === null) { // 首次渲染：创建所有子节点
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes,
    );
  } else { // 更新渲染：协调新旧子节点
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderLanes,
    );
  }
}

function reconcileChildFibers(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChild: any,
  lanes: Lanes,
): Fiber | null {
  if (newChild === null || newChild === undefined) {
    return null;
  }

  // 处理单个 React Element
  if (typeof newChild === 'object' && newChild.$$typeof === REACT_ELEMENT_TYPE) {
    return placeSingleChild(
      reconcileSingleElement(returnFiber, currentFirstChild, newChild, lanes)
    );
  }

  // 处理字符串/数字
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    return placeSingleChild(
      reconcileSingleTextNode(returnFiber, currentFirstChild, '' + newChild, lanes)
    );
  }

  // 处理数组
  if (isArray(newChild)) {
    return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, lanes);
  }

  // 处理其他类型
  if (getIteratorFn(newChild)) {
    return reconcileChildrenIterator(
      returnFiber,
      currentFirstChild,
      newChild,
      lanes,
    );
  }

  // 处理 Portal
  if (newChild.$$typeof === REACT_PORTAL_TYPE) {
    return placeSingleChild(
      reconcileSinglePortal(returnFiber, currentFirstChild, newChild, lanes)
    );
  }

  // 处理 Lazy 组件
  if (newChild.$$typeof === REACT_LAZY_TYPE) {
    const payload = newChild._payload;
    const init = newChild._init;
    newChild = init(payload);
    return reconcileChildFibers(returnFiber, currentFirstChild, newChild, lanes);
  }

  return null;
}

// 单个元素的 Diff 算法
function reconcileSingleElement(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  element: ReactElement,
  lanes: Lanes,
): Fiber {
  const key = element.key;
  let child = currentFirstChild;

  // 1. 查找可复用的 Fiber 节点
  while (child !== null) {
    if (child.key === key) {
      // key 匹配，检查 type 是否也匹配
      if (child.elementType === element.type) {
        // 完全匹配，可以复用
        deleteRemainingChildren(returnFiber, child.sibling);
        const existing = useFiber(child, element.props);
        existing.return = returnFiber;
        return existing;
      } else {
        // key 匹配但 type 不匹配，删除所有子节点
        deleteRemainingChildren(returnFiber, child);
        break;
      }
    } else {
      // key 不匹配，删除当前节点
      deleteChild(returnFiber, child);
    }
    child = child.sibling;
  }

  // 2. 创建新的 Fiber 节点
  const created = createFiberFromElement(element, returnFiber, lanes);
  created.return = returnFiber;
  return created;
}

// 复用 Fiber 节点的逻辑
function useFiber(fiber: Fiber, pendingProps: Props): Fiber {
  // 创建新的 Fiber 节点作为 alternate
  const clone = createWorkInProgress(fiber, pendingProps);
  
  // 重置索引
  clone.index = 0;
  clone.sibling = null;
  
  return clone;
}

function createWorkInProgress(current: Fiber, pendingProps: Props): Fiber {
  let workInProgress = current.alternate;
  
  if (workInProgress === null) {
    // 创建新的 alternate
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode,
    );
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    
    // 建立双向引用
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // 复用现有的 alternate
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    
    // 重置副作用标记
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
    workInProgress.deletions = null;
  }
  
  // 复制其他属性
  workInProgress.lanes = current.lanes;
  workInProgress.childLanes = current.childLanes;
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  
  return workInProgress;
}

// 数组元素的 Diff 算法
// 详细的可视化流程图和说明请参考: [array-diff-visualization.md](./array-diff-visualization.md)
function reconcileChildrenArray(
  returnFiber: Fiber, // 父级 Fiber 节点，当前处理的子节点的父节点
  currentFirstChild: Fiber | null, // 当前已存在的第一个子 Fiber 节点（workInProgress 树中的）
  newChildren: Array<*>, // 新的子节点数组（来自 JSX 的 children）
  lanes: Lanes, // 优先级车道，用于调度
): Fiber | null {
  let resultingFirstChild: Fiber | null = null; // 最终返回的新子节点链表的头节点
  let previousNewFiber: Fiber | null = null; // 上一个新创建的 Fiber 节点，用于构建链表
  let oldFiber = currentFirstChild; // 当前正在处理的旧 Fiber 节点
  let lastPlacedIndex = 0; // 最后一个被放置的节点的索引，用于确定节点是否需要移动
  let newIdx = 0; // 新子节点数组的当前索引
  let nextOldFiber = null; // 下一个要处理的旧 Fiber 节点

  // 1. 第一轮：处理 key 相同的节点
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    if (oldFiber.index > newIdx) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }
    
    // 尝试复用或创建新的 Fiber 节点
    const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], lanes);
    
    if (newFiber === null) {
      // 无法复用，跳出循环
      if (oldFiber === null) {
        oldFiber = nextOldFiber;
      }
      break;
    }
    
    if (shouldTrackSideEffects) {
      if (oldFiber && newFiber.alternate === null) {
        // 新创建的 Fiber，标记为 Placement
        deleteChild(returnFiber, oldFiber);
      }
    }

    // 确定节点是否需要移动
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
    
    if (previousNewFiber === null) {
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
    oldFiber = nextOldFiber;
  }

  // 2. 处理剩余的新节点
  if (newIdx === newChildren.length) {
    // 新节点处理完毕，删除剩余的旧节点
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }

  // 3. 处理剩余的旧节点
  if (oldFiber === null) {
    // 没有旧节点，创建所有新节点
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
      if (newFiber === null) {
        continue;
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
    return resultingFirstChild;
  }

  // 4. 第二轮：处理剩余的节点，使用 Map 优化查找
  // 将剩余的旧节点映射到 Map 中，key 为节点的 key 或索引
  const existingChildren = mapRemainingChildren(oldFiber);
  
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = updateFromMap(
      existingChildren, // 剩余旧节点的 Map
      returnFiber, // 父节点
      newIdx, // 新节点在数组中的索引
      newChildren[newIdx], // 新的子节点
      lanes,
    );
    
    if (newFiber !== null) {
      if (shouldTrackSideEffects) {
        if (newFiber.alternate !== null) {
          // 复用的节点，从 Map 中移除（避免重复处理）
          existingChildren.delete(
            newFiber.key === null ? newIdx : newFiber.key,
          );
        }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
  }

  // 5. 删除剩余的旧节点 
  if (shouldTrackSideEffects) {
    existingChildren.forEach(child => deleteChild(returnFiber, child));
  }

  return resultingFirstChild;
}
```

示例场景

旧节点: A → B → C → D  
新节点: [A, B, E, C]

执行过程可视化

第一轮遍历

按顺序处理，最大化复用相同位置的节点。

lastPlacedIndex 用于记录最后一个被放置的节点的索引，如果当前节点的索引 < lastPlacedIndex，说明需要移动，避免了不必要的 DOM 移动操作。下面是一个演示。

```text
新节点顺序: [A, B, C, D]
lastPlacedIndex = 2 (C 的位置)
如果下一个节点 D 的索引是 3 > 2，不需要移动
如果下一个节点 B 的索引是 1 < 2，需要移动
```

```text
步骤 1: newIdx = 0
┌─────────────────────────────────────┐
│ 旧节点: A → B → C → D               │
│ 新节点: [A, B, E, C]                │
│ 当前: oldFiber=A, newChildren[0]=A  │
└─────────────────────────────────────┘
         ↓ key 相同，复用
┌─────────────────────────────────────┐
│ 结果: A (复用)                      │
│ lastPlacedIndex = 0                 │
│ 剩余旧节点: B → C → D               │
└─────────────────────────────────────┘

步骤 2: newIdx = 1
┌─────────────────────────────────────┐
│ 旧节点: B → C → D                   │
│ 新节点: [A, B, E, C]                │
│ 当前: oldFiber=B, newChildren[1]=B  │
└─────────────────────────────────────┘
         ↓ key 相同，复用
┌─────────────────────────────────────┐
│ 结果: A → B (复用)                  │
│ lastPlacedIndex = 1                 │
│ 剩余旧节点: C → D                   │
└─────────────────────────────────────┘

步骤 3: newIdx = 2
┌─────────────────────────────────────┐
│ 旧节点: C → D                       │
│ 新节点: [A, B, E, C]                │
│ 当前: oldFiber=C, newChildren[2]=E  │
└─────────────────────────────────────┘
         ↓ key 不同，无法复用，跳出循环
```

第二轮遍历

使用 Map 查找，处理位置变化的节点

```text
构建 Map:
┌─────────────────────────────────────┐
│ existingChildren = {                │
│   'C': oldFiber(C),                 │
│   'D': oldFiber(D)                  │
│ }                                   │
└─────────────────────────────────────┘

处理剩余新节点:

步骤 1: newIdx = 2, newChildren[2] = E
┌─────────────────────────────────────┐
│ 在 Map 中查找 key='E'               │
│ 结果: 未找到                        │
│ 操作: 创建新节点 E                  │
└─────────────────────────────────────┘

步骤 2: newIdx = 3, newChildren[3] = C
┌─────────────────────────────────────┐
│ 在 Map 中查找 key='C'               │
│ 结果: 找到 oldFiber(C)              │
│ 操作: 复用节点 C，从 Map 中删除     │
└─────────────────────────────────────┘

清理阶段:
┌─────────────────────────────────────┐
│ 删除 Map 中剩余节点: D              │
│ 最终结果: A → B → E → C            │
└─────────────────────────────────────┘
```

```javascript
function createChild(
  returnFiber: Fiber,
  newChild: any,
  lanes: Lanes,
): Fiber | null {
  if (
    (typeof newChild === 'string' && newChild !== '') ||
    typeof newChild === 'number' ||
    typeof newChild === 'bigint'
  ) {
    const created = createFiberFromText(
      '' + newChild,
      returnFiber.mode,
      lanes,
    );
    created.return = returnFiber;
    return created;
  }

  if (typeof newChild === 'object' && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        const created = createFiberFromElement(
          newChild,
          returnFiber.mode,
          lanes,
        );
        coerceRef(created, newChild);
        created.return = returnFiber;
        return created;
      }
      case REACT_PORTAL_TYPE: { }
      case REACT_LAZY_TYPE: { }
    }

    // ...
  }

  return null;
}

function updateSlot(
  returnFiber: Fiber,
  oldFiber: Fiber | null,
  newChild: any,
  lanes: Lanes,
): Fiber | null {
  const key = oldFiber !== null ? oldFiber.key : null;

  if (typeof newChild === 'string' || typeof newChild === 'number') {
    // 处理文本节点
    if (key !== null) {
      return null;
    }
    return updateTextNode(returnFiber, oldFiber, '' + newChild, lanes);
  }

  if (typeof newChild === 'object' && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        if (newChild.key === key) {
          // key 匹配，可以复用
          return updateElement(returnFiber, oldFiber, newChild, lanes);
        } else {
          // key 不匹配
          return null;
        }
      }
      case REACT_PORTAL_TYPE: {
        if (newChild.key === key) {
          return updatePortal(returnFiber, oldFiber, newChild, lanes);
        } else {
          return null;
        }
      }
    }
  }

  return null;
}

function mapRemainingChildren(
  currentFirstChild: Fiber,
): Map<string | number, Fiber> {
  const existingChildren = new Map();
  let existingChild = currentFirstChild;
  
  while (existingChild !== null) {
    if (existingChild.key !== null) {
      existingChildren.set(existingChild.key, existingChild);
    } else {
      existingChildren.set(existingChild.index, existingChild);
    }
    existingChild = existingChild.sibling;
  }
  
  return existingChildren;
}

// 文本节点的 Diff 算法
function reconcileSingleTextNode(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  textContent: string,
  lanes: Lanes,
): Fiber {
  if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
    // 复用现有的文本节点
    deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
    const existing = useFiber(currentFirstChild, textContent);
    existing.return = returnFiber;
    return existing;
  }
  
  // 创建新的文本节点
  deleteRemainingChildren(returnFiber, currentFirstChild);
  const created = createFiberFromText(textContent, returnFiber, lanes);
  created.return = returnFiber;
  return created;
}

// 节点放置算法
function placeChild(
  newFiber: Fiber,
  lastPlacedIndex: number,
  newIndex: number,
): number {
  newFiber.index = newIndex;
  
  if (!shouldTrackSideEffects) {
    // 首次渲染，不需要标记副作用
    return lastPlacedIndex;
  }
  
  const current = newFiber.alternate;
  if (current !== null) {
    const oldIndex = current.index;
    if (oldIndex < lastPlacedIndex) {
      // 旧节点在已放置节点之前，需要移动
      newFiber.flags |= Placement;
      return lastPlacedIndex;
    } else {
      // 旧节点在已放置节点之后，不需要移动
      return oldIndex;
    }
  } else {
    // 新节点，需要插入
    newFiber.flags |= Placement;
    return lastPlacedIndex;
  }
}

// 删除节点的处理
function deleteChild(returnFiber: Fiber, childToDelete: Fiber): void {
  if (!shouldTrackSideEffects) {
    // 首次渲染，不需要标记副作用
    return;
  }
  
  // 标记为删除
  childToDelete.flags |= Deletion;
  
  // 添加到删除列表
  if (returnFiber.deletions === null) {
    returnFiber.deletions = [childToDelete];
    returnFiber.flags |= ChildDeletion;
  } else {
    returnFiber.deletions.push(childToDelete);
  }
}

function deleteRemainingChildren(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
): null {
  if (!shouldTrackSideEffects) {
    // 首次渲染，不需要标记副作用
    return null;
  }
  
  let childToDelete = currentFirstChild;
  while (childToDelete !== null) {
    deleteChild(returnFiber, childToDelete);
    childToDelete = childToDelete.sibling;
  }
  return null;
}
```

```text
reconcileChildren()
    ↓
reconcileChildFibers()
    ↓
判断newChild类型
    ↓
├─ 单个React Element → reconcileSingleElement()
├─ 字符串/数字 → reconcileSingleTextNode()
├─ 数组 → reconcileChildrenArray()
├─ Iterator → reconcileChildrenIterator()
├─ Portal → reconcileSinglePortal()
└─ Lazy → 解析后递归调用
    ↓
具体的Diff算法
    ↓
├─ 查找可复用节点
├─ 创建新节点
├─ 删除旧节点
├─ 标记副作用
└─ 返回新的子节点
    ↓
placeChild() - 确定节点位置
    ↓
标记DOM操作类型
    ↓
返回协调后的Fiber树
```

## 四、虚拟 DOM 实现

```javascript
// 简化版的 React 虚拟 DOM 实现
class SimpleReact {
  constructor() {
    this.currentRoot = null;
    this.workInProgressRoot = null;
    this.deletions = [];
    this.workInProgressFiber = null;
    this.hookIndex = null;
  }

  // 创建元素
  createElement(type, props, ...children) {
    return {
      type,
      props: {
        ...props,
        children: children.map(child =>
          typeof child === 'object' ? child : this.createTextElement(child)
        )
      }
    };
  }

  createTextElement(text) {
    return {
      type: 'TEXT_ELEMENT',
      props: {
        nodeValue: text,
        children: []
      }
    };
  }

  // 渲染函数
  render(element, container) {
    this.workInProgressRoot = {
      dom: container,
      props: {
        children: [element]
      },
      alternate: this.currentRoot
    };
    this.deletions = [];
    this.nextUnitOfWork = this.workInProgressRoot;
  }

  // 工作循环
  workLoop(deadline) {
    let shouldYield = false;
    
    while (this.nextUnitOfWork && !shouldYield) {
      this.nextUnitOfWork = this.performUnitOfWork(this.nextUnitOfWork);
      shouldYield = deadline.timeRemaining() < 1;
    }

    if (!this.nextUnitOfWork && this.workInProgressRoot) {
      this.commitRoot();
    }

    requestIdleCallback(this.workLoop.bind(this));
  }

  // 执行工作单元
  performUnitOfWork(fiber) {
    const isFunctionComponent = fiber.type instanceof Function;
    
    if (isFunctionComponent) {
      this.updateFunctionComponent(fiber);
    } else {
      this.updateHostComponent(fiber);
    }

    if (fiber.child) {
      return fiber.child;
    }
    
    let nextFiber = fiber;
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling;
      }
      nextFiber = nextFiber.return;
    }
  }

  // 更新函数组件
  updateFunctionComponent(fiber) {
    this.workInProgressFiber = fiber;
    this.hookIndex = 0;
    this.workInProgressFiber.hooks = [];
    
    const children = [fiber.type(fiber.props)];
    this.reconcileChildren(fiber, children);
  }

  // 更新DOM组件
  updateHostComponent(fiber) {
    if (!fiber.dom) {
      fiber.dom = this.createDom(fiber);
    }
    
    this.reconcileChildren(fiber, fiber.props.children);
  }

  // 创建DOM节点
  createDom(fiber) {
    const dom = fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

    this.updateDom(dom, {}, fiber.props);
    return dom;
  }

  // 更新 DOM 属性
  updateDom(dom, prevProps, nextProps) {
    // 删除旧属性
    Object.keys(prevProps)
      .filter(name => name !== 'children')
      .filter(name => !(name in nextProps))
      .forEach(name => {
        if (name.startsWith('on')) {
          const eventType = name.toLowerCase().substring(2);
          dom.removeEventListener(eventType, prevProps[name]);
        } else {
          dom[name] = '';
        }
      });

    // 设置新属性
    Object.keys(nextProps)
      .filter(name => name !== 'children')
      .filter(name => prevProps[name] !== nextProps[name])
      .forEach(name => {
        if (name.startsWith('on')) {
          const eventType = name.toLowerCase().substring(2);
          dom.addEventListener(eventType, nextProps[name]);
        } else {
          dom[name] = nextProps[name];
        }
      });
  }

  // 协调子元素
  reconcileChildren(workInProgressFiber, elements) {
    let index = 0;
    let oldFiber = workInProgressFiber.alternate && workInProgressFiber.alternate.child;
    let prevSibling = null;

    while (index < elements.length || oldFiber != null) {
      const element = elements[index];
      let newFiber = null;

      const sameType = oldFiber && element && element.type === oldFiber.type;

      if (sameType) {
        // 更新节点
        newFiber = {
          type: oldFiber.type,
          props: element.props,
          dom: oldFiber.dom,
          return: workInProgressFiber,
          alternate: oldFiber,
          effectTag: 'UPDATE'
        };
      }
      
      if (element && !sameType) {
        // 添加节点
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          return: workInProgressFiber,
          alternate: null,
          effectTag: 'PLACEMENT'
        };
      }
      
      if (oldFiber && !sameType) {
        // 删除节点
        oldFiber.effectTag = 'DELETION';
        this.deletions.push(oldFiber);
      }

      if (oldFiber) {
        oldFiber = oldFiber.sibling;
      }

      if (index === 0) {
        workInProgressFiber.child = newFiber;
      } else if (element) {
        prevSibling.sibling = newFiber;
      }

      prevSibling = newFiber;
      index++;
    }
  }

  // 提交根节点
  commitRoot() {
    this.deletions.forEach(this.commitWork.bind(this));
    this.commitWork(this.workInProgressRoot.child);
    this.currentRoot = this.workInProgressRoot;
    this.workInProgressRoot = null;
  }

  // 提交工作
  commitWork(fiber) {
    if (!fiber) return;

    let domParentFiber = fiber.return;
    while (!domParentFiber.dom) {
      domParentFiber = domParentFiber.return;
    }
    const domParent = domParentFiber.dom;

    if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
      domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
      this.updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    } else if (fiber.effectTag === 'DELETION') {
      this.commitDeletion(fiber, domParent);
    }

    this.commitWork(fiber.child);
    this.commitWork(fiber.sibling);
  }

  commitDeletion(fiber, domParent) {
    if (fiber.dom) {
      domParent.removeChild(fiber.dom);
    } else {
      this.commitDeletion(fiber.child, domParent);
    }
  }

  // useState Hook实现
  useState(initial) {
    const oldHook = this.workInProgressFiber.alternate &&
      this.workInProgressFiber.alternate.hooks &&
      this.workInProgressFiber.alternate.hooks[this.hookIndex];
    
    const hook = {
      state: oldHook ? oldHook.state : initial,
      queue: []
    };

    const actions = oldHook ? oldHook.queue : [];
    actions.forEach(action => {
      hook.state = action(hook.state);
    });

    const setState = (action) => {
      hook.queue.push(action);
      this.workInProgressRoot = {
        dom: this.currentRoot.dom,
        props: this.currentRoot.props,
        alternate: this.currentRoot
      };
      this.nextUnitOfWork = this.workInProgressRoot;
      this.deletions = [];
    };

    this.workInProgressFiber.hooks.push(hook);
    this.hookIndex++;
    
    return [hook.state, setState];
  }
}

// 使用示例
const instance = new SimpleReact();

// 启动工作循环
requestIdleCallback(instance.workLoop.bind(instance));

// 创建组件
function Counter() {
  const [state, setState] = instance.useState(1);
  
  return instance.createElement(
    'div',
    null,
    instance.createElement('h1', null, 'Count: ', state),
    instance.createElement(
      'button',
      { onClick: () => setState(c => c + 1) },
      'Click me'
    )
  );
}

// 渲染应用
const element = instance.createElement(Counter);
const container = document.getElementById('root');
instance.render(element, container);
```
