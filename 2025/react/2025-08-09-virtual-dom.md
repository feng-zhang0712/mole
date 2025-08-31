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

## 三、diff 算法

虚拟 DOM 的 diff 算法通过比较新旧虚拟 DOM 树的差异，最小化对真实 DOM 的操作，diff 算法基于两个假设。

- 相同类型的组件产生相似的树结构。这个假设允许 React 在更新时复用已有的组件实例，而不是重新创建整个组件树。
- 不同类型的组件产生不同的树结构。因为不同类型的组件通常有不同的内部结构和行为。

之所以这样假设，是为了避免不必要的深度比较，另外，这样的假设在大多数情况下都成立。

diff 算法采用**分层比较**的策略，只对同一层级的节点进行比较，不会跨层级比较。跨层级比较的复杂度是 `O(n³)`，而同层级比较的复杂度是 `O(n)`，性能更好，而且在 Web 应用中，跨层级的 DOM 操作非常罕见。

diff 算法的比较，从三个层面进行：`Tree Diff`、`Component Diff` 和 `Element Diff`。

- **Tree Diff**：只比较同层级的节点。
- **Component Diff**：相同类型的组件继续 diff，不同类型直接替换。
- **Element Diff**：通过 `key` 属性优化列表渲染。

不过，diff 算法也有局限性，比如，无法处理跨层级的 DOM 操作，列表渲染严重依赖 key 属性等。

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

  // 5. 处理其他类型
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
function reconcileChildrenArray(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChildren: Array<*>,
  lanes: Lanes,
): Fiber | null {
  let resultingFirstChild: Fiber | null = null;
  let previousNewFiber: Fiber | null = null;
  let oldFiber = currentFirstChild;
  let lastPlacedIndex = 0;
  let newIdx = 0;
  let nextOldFiber = null;

  // 1. 第一轮：处理 key 相同的节点
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    if (oldFiber.index > newIdx) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }
    
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
  const existingChildren = mapRemainingChildren(oldFiber);
  
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIdx],
      lanes,
    );
    
    if (newFiber !== null) {
      if (shouldTrackSideEffects) {
        if (newFiber.alternate !== null) {
          // 复用的节点，从 Map 中移除
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

```
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
