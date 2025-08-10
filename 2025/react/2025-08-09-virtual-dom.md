# React 的虚拟 DOM

## 一、介绍

本文档的所有分析及源码，基于 React v19.1.1 版本。

### 1.1 基本概念

虚拟 DOM（Virtual DOM）是 React 中一个核心概念，它是真实 DOM 的 JavaScript 对象表示。虚拟 DOM 提供了一种声明式的编程模型，在内存中保存 UI 的"理想状态"，并通过协调过程与真实 DOM 保持同步。

### 1.2 核心理念

虚拟 DOM 的核心理念，可以用一个公式来表示。

```javascript
UI = f(state)
```

上面代码中，`UI` 指用户界面，`f` 是渲染函数，`state` 是应用状态。当状态变化时，React 创建新的虚拟 DOM 树，通过 diff 算法，与之前的虚拟 DOM 树进行比较，从而找出最小变更集，最后将变更应用到真实 DOM。

虚拟 DOM 有四个特点。

- 轻量级对象：虚拟 DOM 节点是普通的 JavaScript 对象，比真实 DOM 节点更轻量。
- 声明式编程：开发者只需描述 UI 应该是什么样子，而不用关心如何更新。
- 跨平台抽象：虚拟 DOM 提供了一层抽象，使 React 能够渲染到不同平台。
- 性能优化：通过批量更新和 diff 算法减少 DOM 操作。

虚拟 DOM 的优势，主要体现在两个方面，一是**通过 diff 算法减少真实 DOM 操作次数**，二是**批量更新机制将多次更新操作**。因此，虚拟 DOM 适合以下场景。

- 复杂UI状态管理。
- 大量数据的部分更新。
- 动画和过渡效果。

不适合下面的场景。

- 简单静态内容。
- 频繁的全量更新。比如，每次列表的 `key` 属性都随机变化。
- 大量计算密集型操作。

### 1.3 虚拟 DOM vs 真实 DOM

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

上面是 `div` 节点打印出来的样子，除了上面的四个属性，还有几十个其他属性和方法。

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

`type` 字段表示元素的类型。

- 对于原生 DOM 元素，值为元素对应的名称。比如，`"div"`、`"span"` 等。
- 函数组件或类组件，值为组件本身。比如，`MyComponent`。
- 对于特殊 React 类型，比如 Fragment 或者 Suspense，真是一个 Symbol 类型。

`key` 字段是 React 用于标识列表中元素的唯一值，通常为字符串或数字。该字段主要用于 diff 算法中，帮助识别哪些元素发生了变化，避免不必要的 DOM 操作。

`ref` 字段用于获取 DOM 节点或组件实例的引用。

`props` 字段包含传递给组件的所有属性，包括 `children`。

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

下面是一个类组件生成 ReactElement 对象的例子。

```jsx
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  
  render() {
    return <div>{this.props.text} - {this.state.count}</div>;
  }
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

下面是一个 React Suspense 组件生成 ReactElement 对象的例子。

```jsx
const element = React.createElement(
  React.Suspense,
  {
    fallback: <div>Loading...</div>
  },
  <AsyncComponent />
);

// 实际生成的 ReactElement 对象
{
  $$typeof: Symbol.for('react.element'),
  type: Symbol.for('react.suspense'),
  key: null,
  ref: null,
  props: {
    fallback: { /* div element */ },
    children: { /* AsyncComponent element */ }
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

注意，上面代码中没有列出没有值的属性。

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

React 新版中这一过程使用 React `jsx-runtime` 运行时模块中的 `jsx` （生产环境使用 `jsx-dev-runtime` 模块的 `jsxDEV` 方法）方法，最终执行语法转换的代码，位于 `packages/react/src/jsx/` 目录。

```javascript
export function jsxProd(type, config, maybeKey) {
  // 1. 处理 `key` 属性
  let key = null;
  if (maybeKey !== undefined) {
    key = '' + maybeKey;
  }
  if (hasValidKey(config)) {
    key = '' + config.key;
  }

  // 2. 将除 `key` 之外的其他属性，挂载到 `props` 对象中
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

  // 3. 如果设置了默认属性 `defaultProps`，则处理对应的默认属性值
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

  // 4. 调用 `ReactElement` 构造函数，创建 ReactElement 对象
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
```

```javascript
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

当 React 开始渲染时，ReactElement 会被转换为 Fiber 节点。这个过程发生在协调（Reconciliation）阶段。

```javascript
export function createFiberFromElement(
  element: ReactElement,
  mode: TypeOfMode,
  lanes: Lanes,
): Fiber {
  const type = element.type;
  const key = element.key;
  const pendingProps = element.props;
  
  let fiberTag = FunctionComponent;
  let resolvedType = type;
  if (typeof type === 'function') {
    if (shouldConstruct(type)) {
      fiberTag = ClassComponent;
    }
  } else if (typeof type === 'string') {
    if (supportsResources && supportsSingletons) {
      const hostContext = getHostContext();
      fiberTag = isHostHoistableType(type, pendingProps, hostContext)
        ? HostHoistable
        : isHostSingletonType(type)
          ? HostSingleton
          : HostComponent;
    } else if (supportsResources) {
      const hostContext = getHostContext();
      fiberTag = isHostHoistableType(type, pendingProps, hostContext)
        ? HostHoistable
        : HostComponent;
    } else if (supportsSingletons) {
      fiberTag = isHostSingletonType(type) ? HostSingleton : HostComponent;
    } else {
      fiberTag = HostComponent;
    }
  } else {
    // 处理其他类型的 ReactElement
    // ...
  }

  const fiber = createFiber(fiberTag, pendingProps, key, mode);
  fiber.elementType = type;
  fiber.type = resolvedType;
  fiber.lanes = lanes;

  return fiber;
}
```

## 三、diff 算法

### 3.1 概述

虚拟 DOM 的 diff 算法通过比较新旧虚拟 DOM 树的差异，最小化对真实 DOM 的操作，从而提升应用性能。

虚拟 DOM 的 diff 算法基于两个前提假设。

- 相同类型的组件产生相似的树结构。这个假设允许 React 在更新时复用已有的组件实例，而不是重新创建整个组件树。
- 不同类型的组件产生不同的树结构。因为不同类型的组件通常有不同的内部结构和行为。

之所以这样假设，是为了避免不必要的深度比较，另外，这样的假设在大多数情况下都成立。

diff 算法采用**分层比较**的策略，只对同一层级的节点进行比较，不会跨层级比较。跨层级比较的复杂度是 `O(n³)`，而同层级比较的复杂度是 `O(n)`，性能更好，而且在 Web 应用中，跨层级的 DOM 操作非常罕见。

React 采用分层比较的策略，这是 diff 算法的核心。只比较同一层级的节点、从上到下，逐层比较、同层节点按顺序比较。

diff 算法的比较，从三个层面进行：`Tree Diff`、`Component Diff` 和 `Element Diff`。

- **Tree Diff**：只比较同层级的节点。
- **Component Diff**：相同类型的组件继续 diff，不同类型直接替换。
- **Element Diff**：通过 `key` 属性优化列表渲染。

不过，diff 算法也有局限性，比如，无法处理跨层级的 DOM 操作，列表渲染严重依赖 key 属性等。





## 四、虚拟 DOM 实现

```javascript
// 简化版的React虚拟DOM实现
class SimpleReact {
  constructor() {
    this.currentRoot = null;
    this.wipRoot = null;
    this.deletions = [];
    this.wipFiber = null;
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
    this.wipRoot = {
      dom: container,
      props: {
        children: [element]
      },
      alternate: this.currentRoot
    };
    this.deletions = [];
    this.nextUnitOfWork = this.wipRoot;
  }

  // 工作循环
  workLoop(deadline) {
    let shouldYield = false;
    
    while (this.nextUnitOfWork && !shouldYield) {
      this.nextUnitOfWork = this.performUnitOfWork(this.nextUnitOfWork);
      shouldYield = deadline.timeRemaining() < 1;
    }

    if (!this.nextUnitOfWork && this.wipRoot) {
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
      nextFiber = nextFiber.parent;
    }
  }

  // 更新函数组件
  updateFunctionComponent(fiber) {
    this.wipFiber = fiber;
    this.hookIndex = 0;
    this.wipFiber.hooks = [];
    
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

  // 更新DOM属性
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
  reconcileChildren(wipFiber, elements) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
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
          parent: wipFiber,
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
          parent: wipFiber,
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
        wipFiber.child = newFiber;
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
    this.commitWork(this.wipRoot.child);
    this.currentRoot = this.wipRoot;
    this.wipRoot = null;
  }

  // 提交工作
  commitWork(fiber) {
    if (!fiber) return;

    let domParentFiber = fiber.parent;
    while (!domParentFiber.dom) {
      domParentFiber = domParentFiber.parent;
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
    const oldHook = this.wipFiber.alternate &&
      this.wipFiber.alternate.hooks &&
      this.wipFiber.alternate.hooks[this.hookIndex];
    
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
      this.wipRoot = {
        dom: this.currentRoot.dom,
        props: this.currentRoot.props,
        alternate: this.currentRoot
      };
      this.nextUnitOfWork = this.wipRoot;
      this.deletions = [];
    };

    this.wipFiber.hooks.push(hook);
    this.hookIndex++;
    
    return [hook.state, setState];
  }
}

// 使用示例
const SimpleReactInstance = new SimpleReact();

// 启动工作循环
requestIdleCallback(SimpleReactInstance.workLoop.bind(SimpleReactInstance));

// 创建组件
function Counter() {
  const [state, setState] = SimpleReactInstance.useState(1);
  
  return SimpleReactInstance.createElement(
    'div',
    null,
    SimpleReactInstance.createElement('h1', null, 'Count: ', state),
    SimpleReactInstance.createElement(
      'button',
      { onClick: () => setState(c => c + 1) },
      'Click me'
    )
  );
}

// 渲染应用
const element = SimpleReactInstance.createElement(Counter);
const container = document.getElementById('root');
SimpleReactInstance.render(element, container);
```


# React虚拟DOM性能分析与实现原理详解

## 性能提升的原理

### 1. 批量更新机制

```javascript
// 自动批量更新的实现原理（简化版）
class SimpleBatcher {
  constructor() {
    this.updateQueue = [];
    this.isUpdating = false;
  }

  enqueueUpdate(component, partialState) {
    this.updateQueue.push({ component, partialState });
    
    if (!this.isUpdating) {
      this.isUpdating = true;
      // 使用微任务确保在同一事件循环中收集所有更新
      Promise.resolve().then(() => {
        this.flushUpdates();
      });
    }
  }

  flushUpdates() {
    const updates = this.updateQueue.slice();
    this.updateQueue = [];
    this.isUpdating = false;

    // 合并同一组件的多个更新
    const componentUpdates = new Map();
    updates.forEach(({ component, partialState }) => {
      if (!componentUpdates.has(component)) {
        componentUpdates.set(component, {});
      }
      Object.assign(componentUpdates.get(component), partialState);
    });

    // 执行批量更新
    componentUpdates.forEach((mergedState, component) => {
      component.setState(mergedState);
    });
  }
}
```

### 2. Diff算法优化

```javascript
// 简化的Diff算法实现
class VirtualDOMDiffer {
  // 比较两个虚拟DOM树
  diff(oldVNode, newVNode) {
    const patches = [];
    
    this.walkAndDiff(oldVNode, newVNode, 0, patches);
    
    return patches;
  }

  walkAndDiff(oldVNode, newVNode, index, patches) {
    let currentPatch = [];

    // 节点被删除
    if (newVNode === null || newVNode === undefined) {
      currentPatch.push({ type: 'REMOVE', index });
    }
    // 文本节点
    else if (typeof oldVNode === 'string' && typeof newVNode === 'string') {
      if (oldVNode !== newVNode) {
        currentPatch.push({ type: 'TEXT', index, content: newVNode });
      }
    }
    // 同类型元素
    else if (oldVNode.type === newVNode.type) {
      // 比较属性
      const attrPatches = this.diffAttributes(oldVNode.props, newVNode.props);
      if (attrPatches.length > 0) {
        currentPatch.push({ type: 'ATTRS', index, attrs: attrPatches });
      }

      // 比较子元素
      this.diffChildren(oldVNode.children, newVNode.children, index, patches);
    }
    // 不同类型元素，直接替换
    else {
      currentPatch.push({ type: 'REPLACE', index, node: newVNode });
    }

    if (currentPatch.length > 0) {
      patches[index] = currentPatch;
    }
  }

  // 比较属性
  diffAttributes(oldAttrs, newAttrs) {
    const patches = [];
    
    // 检查属性变化和新增
    for (let key in newAttrs) {
      if (oldAttrs[key] !== newAttrs[key]) {
        patches.push({ name: key, value: newAttrs[key] });
      }
    }
    
    // 检查删除的属性
    for (let key in oldAttrs) {
      if (!(key in newAttrs)) {
        patches.push({ name: key, value: null });
      }
    }
    
    return patches;
  }

  // 比较子元素（简化版本，未实现key优化）
  diffChildren(oldChildren, newChildren, index, patches) {
    let leftNode = null;
    let currentNodeIndex = index;
    
    for (let i = 0; i < Math.max(oldChildren.length, newChildren.length); i++) {
      const oldChild = oldChildren[i];
      const newChild = newChildren[i];
      
      currentNodeIndex = index + i + 1;
      this.walkAndDiff(oldChild, newChild, currentNodeIndex, patches);
    }
  }
}

// 使用示例
const differ = new VirtualDOMDiffer();

const oldVNode = {
  type: 'div',
  props: { className: 'container' },
  children: [
    { type: 'h1', props: {}, children: ['老标题'] },
    { type: 'p', props: {}, children: ['老内容'] }
  ]
};

const newVNode = {
  type: 'div',
  props: { className: 'container updated' },
  children: [
    { type: 'h1', props: {}, children: ['新标题'] },
    { type: 'p', props: {}, children: ['新内容'] },
    { type: 'span', props: {}, children: ['新增元素'] }
  ]
};

const patches = differ.diff(oldVNode, newVNode);
console.log('需要应用的补丁:', patches);
```

## 虚拟DOM实现原理

### 1. 虚拟DOM节点结构

```javascript
// 虚拟DOM节点的基本结构
class VNode {
  constructor(type, props = {}, children = []) {
    this.type = type;           // 元素类型：'div', 'span', 组件函数等
    this.props = props;         // 属性对象
    this.children = children;   // 子节点数组
    this.key = props.key;       // 用于diff优化的key
    this.ref = props.ref;       // ref引用
    
    // React内部属性
    this._owner = null;         // 创建该节点的组件实例
    this._store = {};           // 存储额外信息
  }

  // 创建文本节点
  static createTextNode(text) {
    return new VNode(null, {}, [], text);
  }

  // 创建元素节点
  static createElement(type, props, ...children) {
    const flatChildren = children.flat().filter(child => 
      child !== null && child !== undefined && child !== false
    );
    
    return new VNode(type, props || {}, flatChildren);
  }

  // 克隆节点
  clone(newProps = {}) {
    return new VNode(
      this.type,
      { ...this.props, ...newProps },
      this.children.slice()
    );
  }
}

// JSX转换示例
function jsx(type, props, ...children) {
  return VNode.createElement(type, props, ...children);
}

// JSX: <div className="container"><span>Hello</span></div>
// 转换为:
const vnode = jsx('div', { className: 'container' },
  jsx('span', null, 'Hello')
);

console.log('虚拟DOM结构:', vnode);
// 输出:
// {
//   type: 'div',
//   props: { className: 'container' },
//   children: [{
//     type: 'span',
//     props: {},
//     children: ['Hello']
//   }]
// }
```

### 2. 渲染器实现

```javascript
// 虚拟DOM渲染器
class VDOMRenderer {
  constructor() {
    this.componentInstances = new Map();
  }

  // 将虚拟DOM渲染为真实DOM
  render(vnode, container) {
    const dom = this.createDOMFromVNode(vnode);
    container.appendChild(dom);
    return dom;
  }

  // 从虚拟节点创建DOM元素
  createDOMFromVNode(vnode) {
    // 处理文本节点
    if (typeof vnode === 'string' || typeof vnode === 'number') {
      return document.createTextNode(vnode);
    }

    // 处理null/undefined
    if (!vnode) {
      return document.createTextNode('');
    }

    // 处理数组
    if (Array.isArray(vnode)) {
      const fragment = document.createDocumentFragment();
      vnode.forEach(child => {
        const childDOM = this.createDOMFromVNode(child);
        fragment.appendChild(childDOM);
      });
      return fragment;
    }

    // 处理组件
    if (typeof vnode.type === 'function') {
      return this.renderComponent(vnode);
    }

    // 处理HTML元素
    if (typeof vnode.type === 'string') {
      return this.renderElement(vnode);
    }

    throw new Error(`Unknown vnode type: ${vnode.type}`);
  }

  // 渲染HTML元素
  renderElement(vnode) {
    const dom = document.createElement(vnode.type);

    // 设置属性
    this.setProps(dom, vnode.props);

    // 渲染子元素
    if (vnode.children) {
      vnode.children.forEach(child => {
        const childDOM = this.createDOMFromVNode(child);
        if (childDOM) {
          dom.appendChild(childDOM);
        }
      });
    }

    return dom;
  }

  // 渲染组件
  renderComponent(vnode) {
    const { type: Component, props } = vnode;

    // 函数组件
    if (typeof Component === 'function' && !Component.prototype.render) {
      const result = Component(props);
      return this.createDOMFromVNode(result);
    }

    // 类组件
    if (Component.prototype && Component.prototype.render) {
      const instance = new Component(props);
      this.componentInstances.set(vnode, instance);
      
      if (instance.componentDidMount) {
        // 延迟执行生命周期方法
        setTimeout(() => instance.componentDidMount(), 0);
      }
      
      const result = instance.render();
      return this.createDOMFromVNode(result);
    }

    throw new Error(`Invalid component: ${Component}`);
  }

  // 设置DOM属性
  setProps(dom, props) {
    Object.keys(props).forEach(key => {
      const value = props[key];

      // 处理事件监听器
      if (key.startsWith('on') && typeof value === 'function') {
        const eventType = key.slice(2).toLowerCase();
        dom.addEventListener(eventType, value);
        return;
      }

      // 处理特殊属性
      switch (key) {
        case 'className':
          dom.className = value;
          break;
        case 'style':
          if (typeof value === 'object') {
            Object.assign(dom.style, value);
          } else {
            dom.style.cssText = value;
          }
          break;
        case 'dangerouslySetInnerHTML':
          if (value && value.__html) {
            dom.innerHTML = value.__html;
          }
          break;
        case 'ref':
          if (typeof value === 'function') {
            value(dom);
          } else if (value && typeof value === 'object') {
            value.current = dom;
          }
          break;
        default:
          // 处理布尔属性
          if (typeof value === 'boolean') {
            if (value) {
              dom.setAttribute(key, '');
            }
          } else {
            dom.setAttribute(key, value);
          }
      }
    });
  }

  // 更新DOM
  update(oldVNode, newVNode, container) {
    const patches = this.diff(oldVNode, newVNode);
    this.applyPatches(container, patches);
  }

  // 应用补丁
  applyPatches(container, patches) {
    patches.forEach(patch => {
      const { type, node, props, children } = patch;
      
      switch (type) {
        case 'CREATE':
          const newDOM = this.createDOMFromVNode(node);
          container.appendChild(newDOM);
          break;
          
        case 'REMOVE':
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
          break;
          
        case 'REPLACE':
          const replacement = this.createDOMFromVNode(node);
          container.replaceChild(replacement, container.firstChild);
          break;
          
        case 'UPDATE':
          this.updateProps(node, props);
          break;
      }
    });
  }

  updateProps(dom, newProps) {
    // 简化的属性更新逻辑
    this.setProps(dom, newProps);
  }
}

// 使用示例
const renderer = new VDOMRenderer();

// 创建虚拟DOM
const vnode = VNode.createElement('div', { className: 'app' },
  VNode.createElement('h1', null, 'Hello Virtual DOM'),
  VNode.createElement('p', null, 'This is a paragraph')
);

// 渲染到页面
const container = document.getElementById('root');
renderer.render(vnode, container);
```

### 3. Diff算法的完整实现

```javascript
// 完整的Diff算法实现
class AdvancedDiffer {
  constructor() {
    this.patches = [];
  }

  // 主要的diff方法
  diff(oldTree, newTree) {
    this.patches = [];
    this.dfs(oldTree, newTree, 0);
    return this.patches;
  }

  // 深度优先遍历比较
  dfs(oldNode, newNode, index) {
    const currentPatch = [];

    // 新节点不存在，删除
    if (!newNode) {
      currentPatch.push({ type: 'REMOVE', index });
    }
    // 都是文本节点
    else if (this.isText(oldNode) && this.isText(newNode)) {
      if (oldNode !== newNode) {
        currentPatch.push({ type: 'TEXT', index, text: newNode });
      }
    }
    // 同类型节点
    else if (oldNode.type === newNode.type) {
      // 比较属性
      const propsPatches = this.diffProps(oldNode.props, newNode.props);
      if (propsPatches.length > 0) {
        currentPatch.push({ type: 'PROPS', index, props: propsPatches });
      }

      // 比较子节点
      this.diffChildren(oldNode.children, newNode.children, index, currentPatch);
    }
    // 不同类型，替换
    else {
      currentPatch.push({ type: 'REPLACE', index, node: newNode });
    }

    if (currentPatch.length > 0) {
      this.patches[index] = currentPatch;
    }
  }

  // 比较子节点（带key优化）
  diffChildren(oldChildren, newChildren, index, patches) {
    const oldKeys = this.getKeys(oldChildren);
    const newKeys = this.getKeys(newChildren);
    
    // 使用key进行优化匹配
    const keyedOld = this.keyBy(oldChildren, oldKeys);
    const keyedNew = this.keyBy(newChildren, newKeys);
    
    let lastIndex = 0;
    let nextIndex = index + 1;

    // 遍历新的子节点
    newChildren.forEach((newChild, i) => {
      const newKey = newKeys[i];
      const oldChild = keyedOld[newKey];
      
      if (oldChild) {
        // 找到对应的旧节点
        const oldIndex = oldChildren.indexOf(oldChild);
        
        if (oldIndex < lastIndex) {
          // 需要移动
          patches.push({
            type: 'MOVE',
            from: oldIndex,
            to: i,
            index: nextIndex
          });
        }
        
        lastIndex = Math.max(oldIndex, lastIndex);
        this.dfs(oldChild, newChild, nextIndex);
      } else {
        // 新增节点
        patches.push({
          type: 'INSERT',
          index: nextIndex,
          node: newChild
        });
      }
      
      nextIndex++;
    });

    // 删除不再需要的节点
    oldChildren.forEach((oldChild, i) => {
      const oldKey = oldKeys[i];
      if (!keyedNew[oldKey]) {
        patches.push({
          type: 'REMOVE',
          index: index + i + 1
        });
      }
    });
  }

  // 获取节点的key数组
  getKeys(children) {
    return children.map((child, index) => 
      child && child.key !== undefined ? child.key : index
    );
  }

  // 根据key创建映射
  keyBy(children, keys) {
    const keyed = {};
    children.forEach((child, index) => {
      const key = keys[index];
      keyed[key] = child;
    });
    return keyed;
  }

  // 比较属性
  diffProps(oldProps, newProps) {
    const patches = [];
    
    // 检查变更和新增的属性
    Object.keys(newProps).forEach(key => {
      if (oldProps[key] !== newProps[key]) {
        patches.push({
          type: 'SET_PROP',
          key,
          value: newProps[key]
        });
      }
    });
    
    // 检查删除的属性
    Object.keys(oldProps).forEach(key => {
      if (!(key in newProps)) {
        patches.push({
          type: 'REMOVE_PROP',
          key
        });
      }
    });
    
    return patches;
  }

  // 判断是否为文本节点
  isText(node) {
    return typeof node === 'string' || typeof node === 'number';
  }
}

// 使用示例
const differ = new AdvancedDiffer();

const oldTree = {
  type: 'ul',
  props: { className: 'list' },
  children: [
    { type: 'li', props: { key: 'a' }, children: ['Item A'] },
    { type: 'li', props: { key: 'b' }, children: ['Item B'] },
    { type: 'li', props: { key: 'c' }, children: ['Item C'] }
  ]
};

const newTree = {
  type: 'ul',
  props: { className: 'list updated' },
  children: [
    { type: 'li', props: { key: 'c' }, children: ['Item C'] },
    { type: 'li', props: { key: 'a' }, children: ['Item A Modified'] },
    { type: 'li', props: { key: 'd' }, children: ['Item D'] }
  ]
};

const patches = differ.diff(oldTree, newTree);
console.log('Diff结果:', patches);
```






## 4. 详细过程分析

### 4.1 整体流程

React 的 diff 过程主要发生在 `reconcileChildren` 函数中，该函数会根据不同的情况调用不同的 reconciliation 策略：

```javascript
// packages/react-reconciler/src/ReactFiberBeginWork.js:336-380
export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderLanes: Lanes,
) {
  if (current === null) {
    // 首次渲染，使用 mountChildFibers
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes,
    );
  } else {
    // 更新渲染，使用 reconcileChildFibers
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderLanes,
    );
  }
}
```

### 4.2 数组子节点的 Diff 算法

React 的数组 diff 算法是 diff 算法的核心，实现在 `reconcileChildrenArray` 函数中：

```javascript
// packages/react-reconciler/src/ReactChildFiber.js:1111-1300
function reconcileChildrenArray(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChildren: Array<any>,
  lanes: Lanes,
): Fiber | null {
  // 第一阶段：遍历新旧子节点，尝试复用
  let oldFiber = currentFirstChild;
  let lastPlacedIndex = 0;
  let newIdx = 0;
  let nextOldFiber = null;
  
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    if (oldFiber.index > newIdx) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }
    
    const newFiber = updateSlot(
      returnFiber,
      oldFiber,
      newChildren[newIdx],
      lanes,
    );
    
    if (newFiber === null) {
      break; // 无法复用，进入第二阶段
    }
    
    // 标记副作用
    if (shouldTrackSideEffects) {
      if (oldFiber && newFiber.alternate === null) {
        deleteChild(returnFiber, oldFiber);
      }
    }
    
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
    // ... 构建新的 fiber 链表
  }
  
  // 第二阶段：处理剩余的新子节点
  if (newIdx === newChildren.length) {
    // 删除剩余的旧子节点
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }
  
  if (oldFiber === null) {
    // 没有更多旧子节点，直接创建新的
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
      // ... 构建新的 fiber 链表
    }
    return resultingFirstChild;
  }
  
  // 第三阶段：使用 Map 进行 key 匹配
  const existingChildren = mapRemainingChildren(oldFiber);
  
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIdx],
      lanes,
    );
    // ... 处理匹配的 fiber
  }
  
  // 删除未使用的旧子节点
  if (shouldTrackSideEffects) {
    existingChildren.forEach(child => deleteChild(returnFiber, child));
  }
  
  return resultingFirstChild;
}
```

### 4.3 三个阶段详解

#### 第一阶段：顺序遍历复用

```javascript
// 尝试按顺序复用相同位置的节点
for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
  const newFiber = updateSlot(
    returnFiber,
    oldFiber,
    newChildren[newIdx],
    lanes,
  );
  
  if (newFiber === null) {
    break; // 无法复用，进入下一阶段
  }
  // ... 处理可复用的节点
}
```

这一阶段通过 `updateSlot` 函数尝试复用相同位置的节点：

```javascript
// packages/react-reconciler/src/ReactChildFiber.js:776-875
function updateSlot(
  returnFiber: Fiber,
  oldFiber: Fiber | null,
  newChild: any,
  lanes: Lanes,
): Fiber | null {
  const key = oldFiber !== null ? oldFiber.key : null;
  
  // 处理文本节点
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    if (key !== null) {
      return null; // 文本节点没有 key，无法复用
    }
    return updateTextNode(returnFiber, oldFiber, '' + newChild, lanes);
  }
  
  // 处理 React 元素
  if (typeof newChild === 'object' && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        if (newChild.key === key) {
          // key 匹配，可以复用
          return updateElement(returnFiber, oldFiber, newChild, lanes);
        } else {
          return null; // key 不匹配，无法复用
        }
      }
      // ... 处理其他类型
    }
  }
  
  return null;
}
```

#### 第二阶段：批量创建新节点

```javascript
if (oldFiber === null) {
  // 没有更多旧子节点，直接创建新的
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
    // ... 构建新的 fiber 链表
  }
  return resultingFirstChild;
}
```

#### 第三阶段：Key 匹配优化

```javascript
// 将剩余的旧子节点放入 Map 中，用于 key 匹配
const existingChildren = mapRemainingChildren(oldFiber);

// 遍历剩余的新子节点，尝试通过 key 匹配复用
for (; newIdx < newChildren.length; newIdx++) {
  const newFiber = updateFromMap(
    existingChildren,
    returnFiber,
    newIdx,
    newChildren[newIdx],
    lanes,
  );
  // ... 处理匹配的 fiber
}
```

`mapRemainingChildren` 函数将剩余的旧子节点按 key 或 index 组织成 Map：

```javascript
// packages/react-reconciler/src/ReactChildFiber.js:422-441
function mapRemainingChildren(
  currentFirstChild: Fiber,
): Map<string | number, Fiber> {
  const existingChildren: Map<string | number, Fiber> = new Map();
  
  let existingChild: null | Fiber = currentFirstChild;
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
```

`updateFromMap` 函数通过 key 查找匹配的旧节点：

```javascript
// packages/react-reconciler/src/ReactChildFiber.js:913-1012
function updateFromMap(
  existingChildren: Map<string | number, Fiber>,
  returnFiber: Fiber,
  newIdx: number,
  newChild: any,
  lanes: Lanes,
): Fiber | null {
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    // 文本节点通过 index 匹配
    const matchedFiber = existingChildren.get(newIdx) || null;
    return updateTextNode(returnFiber, matchedFiber, '' + newChild, lanes);
  }
  
  if (typeof newChild === 'object' && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        // React 元素通过 key 匹配
        const matchedFiber = existingChildren.get(
          newChild.key === null ? newIdx : newChild.key,
        ) || null;
        return updateElement(returnFiber, matchedFiber, newChild, lanes);
      }
      // ... 处理其他类型
    }
  }
  
  return null;
}
```

### 4.4 节点位置优化

React 通过 `placeChild` 函数优化节点的位置，避免不必要的移动：

```javascript
// packages/react-reconciler/src/ReactChildFiber.js:451-480
function placeChild(
  newFiber: Fiber,
  lastPlacedIndex: number,
  newIndex: number,
): number {
  newFiber.index = newIndex;
  
  if (!shouldTrackSideEffects) {
    return lastPlacedIndex;
  }
  
  const current = newFiber.alternate;
  if (current !== null) {
    const oldIndex = current.index;
    if (oldIndex < lastPlacedIndex) {
      // 需要移动
      newFiber.flags |= Placement | PlacementDEV;
      return lastPlacedIndex;
    } else {
      // 可以保持原位
      return oldIndex;
    }
  } else {
    // 新插入的节点
    newFiber.flags |= Placement | PlacementDEV;
    return lastPlacedIndex;
  }
}
```

## 5. Key 属性的重要性

### 5.1 Key 的作用

Key 属性是 React diff 算法优化的关键：

1. **身份标识**: 帮助 React 识别哪些节点发生了变化
2. **复用优化**: 相同 key 的节点可以复用，避免重新创建
3. **位置优化**: 帮助 React 确定节点的移动策略

### 5.2 Key 的选择原则

```javascript
// 好的 key 选择
{items.map(item => (
  <ListItem key={item.id} data={item} />
))}

// 不好的 key 选择
{items.map((item, index) => (
  <ListItem key={index} data={item} />
))}
```

### 5.3 Key 的警告机制

React 会检查开发者是否正确使用了 key：

```javascript
// packages/react-reconciler/src/ReactChildFiber.js:127-203
warnForMissingKey = (
  returnFiber: Fiber,
  workInProgress: Fiber,
  child: mixed,
) => {
  if (child === null || typeof child !== 'object') {
    return;
  }
  
  if (
    !child._store ||
    ((child._store.validated || child.key != null) &&
      child._store.validated !== 2)
  ) {
    return;
  }
  
  // 发出警告
  console.error(
    'Each child in a list should have a unique "key" prop.' +
    '%s%s See https://react.dev/link/warning-keys for more information.',
    currentComponentErrorInfo,
    childOwnerAppendix,
  );
};
```
