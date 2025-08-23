<!-- 

# React Router 源码分析：BrowserRouter 和 HashRouter 实现原理

## 概述

React Router 中的 `BrowserRouter` 和 `HashRouter` 是两种不同的路由实现方式，它们都基于底层的 History API，但处理 URL 的方式不同。本文将从源码角度详细分析它们的实现原理。

## 1. 核心架构

### 1.1 组件层次结构

```
BrowserRouter/HashRouter
    ↓
Router (核心组件)
    ↓
NavigationContext.Provider
    ↓
LocationContext.Provider
    ↓
子组件
```

### 1.2 关键接口定义

```typescript
// 历史记录接口
interface History {
  readonly action: Action;
  readonly location: Location;
  createHref(to: To): string;
  createURL(to: To): URL;
  encodeLocation(to: To): Path;
  push(to: To, state?: any): void;
  replace(to: To, state?: any): void;
  go(delta: number): void;
  listen(listener: Listener): () => void;
}

// 位置接口
interface Location<State = any> extends Path {
  state: State;
  key: string;
}

// 路径接口
interface Path {
  pathname: string;
  search: string;
  hash: string;
}
```

## 2. BrowserRouter 实现分析

### 2.1 核心实现代码

```typescript
export function BrowserRouter({
  basename,
  children,
  window,
}: BrowserRouterProps) {
  // 1. 创建 history 实例（使用 useRef 确保单例）
  let historyRef = React.useRef<BrowserHistory>();
  if (historyRef.current == null) {
    historyRef.current = createBrowserHistory({ window, v5Compat: true });
  }

  let history = historyRef.current;
  
  // 2. 状态管理
  let [state, setStateImpl] = React.useState({
    action: history.action,
    location: history.location,
  });
  
  // 3. 状态更新函数（使用 startTransition 优化性能）
  let setState = React.useCallback(
    (newState: { action: NavigationType; location: Location }) => {
      React.startTransition(() => setStateImpl(newState));
    },
    [setStateImpl]
  );

  // 4. 监听历史记录变化
  React.useLayoutEffect(() => history.listen(setState), [history, setState]);

  // 5. 渲染 Router 组件
  return (
    <Router
      basename={basename}
      children={children}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    />
  );
}
```

### 2.2 createBrowserHistory 实现

```typescript
export function createBrowserHistory(
  options: BrowserHistoryOptions = {}
): BrowserHistory {
  // 1. 创建浏览器位置解析函数
  function createBrowserLocation(
    window: Window,
    globalHistory: Window["history"]
  ) {
    let { pathname, search, hash } = window.location;
    return createLocation(
      "",
      { pathname, search, hash },
      // 从 history.state 中恢复用户状态
      (globalHistory.state && globalHistory.state.usr) || null,
      (globalHistory.state && globalHistory.state.key) || "default"
    );
  }

  // 2. 创建浏览器 href 生成函数
  function createBrowserHref(window: Window, to: To) {
    return typeof to === "string" ? to : createPath(to);
  }

  // 3. 返回基于 URL 的历史记录对象
  return getUrlBasedHistory(
    createBrowserLocation,
    createBrowserHref,
    null, // 不需要验证
    options
  );
}
```

### 2.3 BrowserRouter 工作原理

1. **URL 处理**：直接使用浏览器的 `window.location` 对象
2. **历史记录**：使用 `window.history` API
3. **状态管理**：通过 `history.state` 存储应用状态
4. **导航**：使用 `pushState` 和 `replaceState` 方法

## 3. HashRouter 实现分析

### 3.1 核心实现代码

```typescript
export function HashRouter({ basename, children, window }: HashRouterProps) {
  // 1. 创建 hash history 实例
  let historyRef = React.useRef<HashHistory>();
  if (historyRef.current == null) {
    historyRef.current = createHashHistory({ window, v5Compat: true });
  }

  let history = historyRef.current;
  
  // 2. 状态管理（与 BrowserRouter 相同）
  let [state, setStateImpl] = React.useState({
    action: history.action,
    location: history.location,
  });
  
  let setState = React.useCallback(
    (newState: { action: NavigationType; location: Location }) => {
      React.startTransition(() => setStateImpl(newState));
    },
    [setStateImpl]
  );

  // 3. 监听历史记录变化
  React.useLayoutEffect(() => history.listen(setState), [history, setState]);

  // 4. 渲染 Router 组件
  return (
    <Router
      basename={basename}
      children={children}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    />
  );
}
```

### 3.2 createHashHistory 实现

```typescript
export function createHashHistory(
  options: HashHistoryOptions = {}
): HashHistory {
  // 1. 创建 hash 位置解析函数
  function createHashLocation(
    window: Window,
    globalHistory: Window["history"]
  ) {
    let {
      pathname = "/",
      search = "",
      hash = "",
    } = parsePath(window.location.hash.substring(1));

    // 确保 pathname 以 / 开头
    if (!pathname.startsWith("/") && !pathname.startsWith(".")) {
      pathname = "/" + pathname;
    }

    return createLocation(
      "",
      { pathname, search, hash },
      (globalHistory.state && globalHistory.state.usr) || null,
      (globalHistory.state && globalHistory.state.key) || "default"
    );
  }

  // 2. 创建 hash href 生成函数
  function createHashHref(window: Window, to: To) {
    let base = window.document.querySelector("base");
    let href = "";

    if (base && base.getAttribute("href")) {
      let url = window.location.href;
      let hashIndex = url.indexOf("#");
      href = hashIndex === -1 ? url : url.slice(0, hashIndex);
    }

    return href + "#" + (typeof to === "string" ? to : createPath(to));
  }

  // 3. 验证 hash 位置
  function validateHashLocation(location: Location, to: To) {
    warning(
      location.pathname.charAt(0) === "/",
      `relative pathnames are not supported in hash history.push(${JSON.stringify(
        to
      )})`
    );
  }

  // 4. 返回基于 URL 的历史记录对象
  return getUrlBasedHistory(
    createHashLocation,
    createHashHref,
    validateHashLocation,
    options
  );
}
```

### 3.3 HashRouter 工作原理

1. **URL 处理**：从 `window.location.hash` 中解析路径
2. **历史记录**：仍然使用 `window.history` API，但 URL 存储在 hash 部分
3. **状态管理**：通过 `history.state` 存储应用状态
4. **导航**：使用 `pushState` 和 `replaceState` 方法，但 URL 变化在 hash 部分

## 4. 核心实现：getUrlBasedHistory

### 4.1 实现代码

```typescript
function getUrlBasedHistory(
  getLocation: (window: Window, globalHistory: Window["history"]) => Location,
  createHref: (window: Window, to: To) => string,
  validateLocation: ((location: Location, to: To) => void) | null,
  options: UrlHistoryOptions = {}
): UrlHistory {
  let { window = document.defaultView!, v5Compat = false } = options;
  let globalHistory = window.history;
  let action = Action.Pop;
  let listener: Listener | null = null;

  // 1. 获取当前索引
  let index = getIndex()!;
  if (index == null) {
    index = 0;
    globalHistory.replaceState({ ...globalHistory.state, idx: index }, "");
  }

  // 2. 获取索引函数
  function getIndex(): number {
    let state = globalHistory.state || { idx: null };
    return state.idx;
  }

  // 3. 处理 popstate 事件
  function handlePop() {
    action = Action.Pop;
    let nextIndex = getIndex();
    let delta = nextIndex == null ? null : nextIndex - index;
    index = nextIndex;
    if (listener) {
      listener({ action, location: history.location, delta });
    }
  }

  // 4. push 方法实现
  function push(to: To, state?: any) {
    action = Action.Push;
    let location = createLocation(history.location, to, state);
    if (validateLocation) validateLocation(location, to);

    index = getIndex() + 1;
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);

    try {
      globalHistory.pushState(historyState, "", url);
    } catch (error) {
      if (error instanceof DOMException && error.name === "DataCloneError") {
        throw error;
      }
      window.location.assign(url);
    }

    if (v5Compat && listener) {
      listener({ action, location: history.location, delta: 1 });
    }
  }

  // 5. replace 方法实现
  function replace(to: To, state?: any) {
    action = Action.Replace;
    let location = createLocation(history.location, to, state);
    if (validateLocation) validateLocation(location, to);

    index = getIndex();
    let historyState = getHistoryState(location, index);
    let url = history.createHref(location);
    globalHistory.replaceState(historyState, "", url);

    if (v5Compat && listener) {
      listener({ action, location: history.location, delta: 0 });
    }
  }

  // 6. 返回历史记录对象
  let history: History = {
    get action() {
      return action;
    },
    get location() {
      return getLocation(window, globalHistory);
    },
    listen(fn: Listener) {
      if (listener) {
        throw new Error("A history only accepts one active listener");
      }
      window.addEventListener(PopStateEventType, handlePop);
      listener = fn;

      return () => {
        window.removeEventListener(PopStateEventType, handlePop);
        listener = null;
      };
    },
    createHref(to) {
      return createHref(window, to);
    },
    createURL,
    encodeLocation(to) {
      let url = createURL(to);
      return {
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
      };
    },
    push,
    replace,
    go(n) {
      return globalHistory.go(n);
    },
  };

  return history;
}
```

## 5. Router 组件实现

### 5.1 核心实现

```typescript
export function Router({
  basename: basenameProp = "/",
  children = null,
  location: locationProp,
  navigationType = NavigationType.Pop,
  navigator,
  static: staticProp = false,
}: RouterProps): React.ReactElement | null {
  // 1. 检查是否在 Router 上下文中
  invariant(
    !useInRouterContext(),
    `You cannot render a <Router> inside another <Router>.` +
      ` You should never have more than one in your app.`
  );

  // 2. 处理 basename
  let basename = basenameProp.replace(/^\/*/, "/");
  let navigationContext = React.useMemo(
    () => ({
      basename,
      navigator,
      static: staticProp,
      future: {},
    }),
    [basename, navigator, staticProp]
  );

  // 3. 解析位置
  if (typeof locationProp === "string") {
    locationProp = parsePath(locationProp);
  }

  let {
    pathname = "/",
    search = "",
    hash = "",
    state = null,
    key = "default",
  } = locationProp;

  // 4. 创建位置上下文
  let locationContext = React.useMemo(() => {
    let trailingPathname = stripBasename(pathname, basename);

    if (trailingPathname == null) {
      return null;
    }

    return {
      location: {
        pathname: trailingPathname,
        search,
        hash,
        state,
        key,
      },
      navigationType,
    };
  }, [basename, pathname, search, hash, state, key, navigationType]);

  // 5. 警告检查
  warning(
    locationContext != null,
    `<Router basename="${basename}"> is not able to match the URL ` +
      `"${pathname}${search}${hash}" because it does not start with the ` +
      `basename, so the <Router> won't render anything.`
  );

  if (locationContext == null) {
    return null;
  }

  // 6. 渲染上下文提供者
  return (
    <NavigationContext.Provider value={navigationContext}>
      <LocationContext.Provider children={children} value={locationContext} />
    </NavigationContext.Provider>
  );
}
```

## 6. 关键差异分析

### 6.1 URL 处理差异

| 特性 | BrowserRouter | HashRouter |
|------|---------------|------------|
| URL 格式 | `https://example.com/path` | `https://example.com/#/path` |
| 服务器请求 | 会发送到服务器 | 不会发送到服务器 |
| SEO 友好性 | 友好 | 不友好 |
| 兼容性 | 需要服务器配置 | 兼容性好 |

### 6.2 实现差异

#### BrowserRouter
```typescript
// 直接从 window.location 获取路径
function createBrowserLocation(window: Window, globalHistory: Window["history"]) {
  let { pathname, search, hash } = window.location;
  return createLocation("", { pathname, search, hash }, ...);
}
```

#### HashRouter
```typescript
// 从 window.location.hash 解析路径
function createHashLocation(window: Window, globalHistory: Window["history"]) {
  let { pathname, search, hash } = parsePath(window.location.hash.substring(1));
  if (!pathname.startsWith("/") && !pathname.startsWith(".")) {
    pathname = "/" + pathname;
  }
  return createLocation("", { pathname, search, hash }, ...);
}
```

## 7. 性能优化

### 7.1 状态更新优化

```typescript
// 使用 startTransition 避免阻塞渲染
let setState = React.useCallback(
  (newState: { action: NavigationType; location: Location }) => {
    React.startTransition(() => setStateImpl(newState));
  },
  [setStateImpl]
);
```

### 7.2 单例模式

```typescript
// 使用 useRef 确保 history 实例只创建一次
let historyRef = React.useRef<BrowserHistory>();
if (historyRef.current == null) {
  historyRef.current = createBrowserHistory({ window, v5Compat: true });
}
```

## 8. 错误处理

### 8.1 序列化错误处理

```typescript
try {
  globalHistory.pushState(historyState, "", url);
} catch (error) {
  if (error instanceof DOMException && error.name === "DataCloneError") {
    throw error;
  }
  // 降级到页面跳转
  window.location.assign(url);
}
```

### 8.2 验证错误

```typescript
function validateHashLocation(location: Location, to: To) {
  warning(
    location.pathname.charAt(0) === "/",
    `relative pathnames are not supported in hash history.push(${JSON.stringify(to)})`
  );
}
```

## 9. 总结

### 9.1 设计模式

1. **工厂模式**：`createBrowserHistory` 和 `createHashHistory` 是工厂函数
2. **观察者模式**：通过 `listen` 方法监听历史记录变化
3. **单例模式**：使用 `useRef` 确保 history 实例唯一
4. **策略模式**：不同的 history 实现使用不同的 URL 处理策略

### 9.2 核心优势

1. **统一接口**：BrowserRouter 和 HashRouter 提供相同的 API
2. **类型安全**：完整的 TypeScript 支持
3. **性能优化**：使用 React 18 的并发特性
4. **错误处理**：完善的错误处理和降级策略

### 9.3 使用建议

- **BrowserRouter**：适用于有服务器控制权的生产环境
- **HashRouter**：适用于静态托管或无法配置服务器的环境
- **MemoryRouter**：适用于测试环境

这种设计使得 React Router 能够适应不同的部署环境和需求，同时保持 API 的一致性。 































# React Router 面试题清单

## 核心概念和基础

### 路由基础

1. **什么是 React Router？它的主要作用是什么？** ⭐⭐⭐
2. **React Router 的三个主要模式（Declarative、Data、Framework）有什么区别？** ⭐⭐⭐
3. **React Router 的核心组件有哪些？** ⭐⭐
4. **什么是路由匹配？React Router 是如何进行路由匹配的？** ⭐⭐
5. **React Router 中的 `path` 和 `index` 有什么区别？** ⭐⭐

### 导航和路由

6. **`<Link>` 和 `useNavigate` 的区别是什么？什么时候使用哪个？** ⭐⭐⭐
7. **`<Navigate>` 组件的作用是什么？** ⭐⭐
8. **什么是嵌套路由？如何实现嵌套路由？** ⭐⭐⭐
9. **`<Outlet>` 组件的作用是什么？** ⭐⭐⭐
10. **什么是布局路由（Layout Routes）？** ⭐⭐

## 重要 Hooks 和 API

### 核心 Hooks ⭐⭐⭐

11. **`useLocation` 的作用是什么？返回什么数据？**
12. **`useNavigate` 的用法有哪些？如何实现编程式导航？**
13. **`useParams` 的作用是什么？如何处理动态路由参数？**
14. **`useSearchParams` 的作用是什么？如何处理查询参数？**
15. **`useOutlet` 和 `useOutletContext` 的区别是什么？**

### 数据相关 Hooks ⭐⭐⭐

16. **`useLoaderData` 的作用是什么？什么时候使用？**
17. **`useActionData` 的作用是什么？与 `useLoaderData` 有什么区别？**
18. **`useRouteError` 的作用是什么？如何处理路由错误？**
19. **`useNavigation` 的作用是什么？如何获取导航状态？**
20. **`useRevalidator` 的作用是什么？如何手动重新验证数据？**

### 高级 Hooks

21. **`useMatches` 的作用是什么？如何获取当前匹配的路由信息？** ⭐⭐
22. **`useBlocker` 的作用是什么？如何阻止导航？** ⭐⭐
23. **`useHref` 的作用是什么？** ⭐
24. **`useResolvedPath` 的作用是什么？** ⭐

## 路由配置和对象

### 路由对象 ⭐⭐⭐
25. **RouteObject 的结构是什么样的？有哪些重要属性？**
26. **什么是 DataRouteObject？与普通 RouteObject 有什么区别？**
27. **`loader` 函数的作用是什么？如何实现数据加载？**
28. **`action` 函数的作用是什么？如何处理表单提交？**
29. **`errorElement` 和 `ErrorBoundary` 的区别是什么？**

### 路由匹配

30. **`matchPath` 和 `matchRoutes` 的区别是什么？** ⭐⭐
31. **路由参数解析的机制是什么？** ⭐⭐
32. **如何处理可选路由参数？** ⭐

## 数据路由和状态管理

### 数据加载 ⭐⭐⭐

33. **React Router 的数据加载机制是什么？**
34. **`loader` 函数如何与组件交互？**
35. **如何处理加载状态和错误状态？**
36. **什么是 `shouldRevalidate`？如何控制数据重新验证？**

### 表单和动作

37. **`<Form>` 组件的作用是什么？与普通 HTML form 有什么区别？** ⭐⭐⭐
38. **`useFetcher` 的作用是什么？什么时候使用？** ⭐⭐⭐
39. **如何处理表单验证和错误？** ⭐⭐
40. **`<Form method="get">` 和 `<Form method="post">` 的区别是什么？** ⭐⭐

## 高级特性

### 路由守卫和拦截
41. **如何实现路由守卫？** ⭐⭐⭐
42. **`useBlocker` 的使用场景有哪些？** ⭐⭐
43. **如何处理导航拦截和确认？** ⭐⭐

### 错误处理 ⭐⭐⭐
44. **React Router 的错误边界机制是什么？**
45. **如何处理 404 错误？**
46. **`errorElement` 和全局错误处理的区别是什么？**

### 性能优化
47. **React Router 的代码分割机制是什么？** ⭐⭐
48. **如何实现懒加载路由？** ⭐⭐
49. **`lazy` 函数的作用是什么？** ⭐⭐

## 历史记录和导航

### 历史管理 ⭐⭐⭐
50. **React Router 支持哪些历史记录类型？**
51. **`BrowserRouter`、`HashRouter`、`MemoryRouter` 的区别是什么？**
52. **如何处理浏览器的前进后退按钮？**

### 导航状态
53. **`navigation.state` 的作用是什么？** ⭐⭐
54. **如何处理导航状态和加载状态？** ⭐⭐

## 实际应用场景

### 常见模式 ⭐⭐⭐
55. **如何实现模态框路由？**
56. **如何实现标签页路由？**
57. **如何实现面包屑导航？**
58. **如何处理认证和授权路由？**

### 集成和兼容性
59. **React Router 与状态管理库（Redux、Zustand）的集成？** ⭐⭐
60. **React Router 与 SSR 的兼容性如何？** ⭐⭐

## 调试和测试

### 调试技巧
61. **如何调试 React Router 的问题？** ⭐⭐
62. **React Router DevTools 的使用方法？** ⭐

### 测试
63. **如何测试 React Router 组件？** ⭐⭐
64. **如何在测试中模拟路由状态？** ⭐⭐

## 版本和迁移

### 版本特性
65. **React Router v6 到 v7 的主要变化有哪些？** ⭐⭐⭐
66. **React Router 的未来发展方向是什么？** ⭐

### 迁移指南
67. **如何从 React Router v5 迁移到 v6？** ⭐⭐
68. **如何从 React Router v6 迁移到 v7？** ⭐⭐

## 最佳实践

### 代码组织
69. **React Router 项目的最佳文件结构是什么？** ⭐⭐
70. **如何组织大型应用的路由配置？** ⭐⭐

### 性能考虑
71. **React Router 应用的性能优化策略有哪些？** ⭐⭐
72. **如何处理路由级别的缓存？** ⭐

## 常见问题和陷阱

### 常见错误 ⭐⭐⭐
73. **"You cannot render a <Router> inside another <Router>" 错误的原因和解决方法？**
74. **路由不匹配的常见原因有哪些？**
75. **如何处理路由参数类型错误？**

### 最佳实践
76. **React Router 的常见反模式有哪些？** ⭐⭐
77. **如何避免路由配置中的常见错误？** ⭐⭐

## 扩展和自定义

### 自定义组件
78. **如何创建自定义路由组件？** ⭐
79. **如何扩展 React Router 的功能？** ⭐

### 第三方集成
80. **React Router 与哪些第三方库集成良好？** ⭐ -->
