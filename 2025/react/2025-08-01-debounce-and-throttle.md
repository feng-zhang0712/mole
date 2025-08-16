# 防抖和节流

## 一、防抖

防抖（debounce）指的是在特定时间间隔内忽略发生得过于频繁的操作，将它们合并为一次调用。即如果在指定的时间间隔之内，尝试多次执行某个动作，则只有**最后一次**执行有效。

防抖的典型用例是响应用户输入。比如，列表页面中有个输入框，用于对输入的内容进行过滤，只要用户在指定的时间间隔内持续输入，就不会执行接口调用，执行查询操作，只有当停止输入的时间大于我们设定的时间，才会触发对接口的请求。

### 基础实现

```javascript
function debounce(func, ms) {
  let timer;
  return function() {
    if (timer) { // 关键代码
     clearTimeout(timer); 
    }
    
    const _this = this;
    timer = setTimeout(function() {
      func.apply(_this, Array.prototype.slice.call(arguments));
      timer = null;
    }, ms);
  }
}
```

```javascript
export function useDebounce(value, ms = 0) {
  const timerRef = useRef();
  const [state, setState] = useState(value);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setState(value);
      timerRef.current = null;
    }, ms);
    return () => clearTimer();
  }, [value, ms, clearTimer]);

  return [state, clearTimer];
}
```

```javascript
export function useDebounceFn(fn, ms = 0, deps = []) {
  const timerRef = useRef();
  const [state, setState] = useState();

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const debounce = useCallback((...args) => {
    clearTimer();
    
    timerRef.current = setTimeout(() => {
      setState(fn(...args));
      timerRef.current = null;
    }, ms);
  }, [fn, ms, clearTimer]);

  useEffect(() => () => clearTimer(), deps);

  return [state, debounce, clearTimer];
}
```

下面是两个使用的例子。

```jsx
// 基础用法
const debouncedSearch = debounce(query => {
  // 搜索内容
}, 300);

// React Hook 用法
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <input
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      placeholder="输入搜索内容..."
    />
  );
}
```

## 二、节流

节流（throttle）最初指通过障碍物减缓流体流速。在编程中，它指的是减慢某个过程的速率，使某项操作只能以一定的频率执行。如果在一段时间内，某个动作频繁触发，则限制其在固定时间间隔内，使其以固定的低频率触发。

节流的典型用例是与另一个持续更新的状态同步。比如监视窗口的 `resize` 事件和滚动条的 `scroll` 事件。

节流的关键是，如果触发器不存在，则创建触发器，并在触发器到期后清空定时器；如果存在，则不执行任何操作。

下面是定时器版本。

```javascript
function throttle(func, ms) {
  let timer;
  return function() {
    if (!timer) { // 关键代码
      const _this = this;
      timer = setTimeout(function() {
        func.apply(_this, Array.prototype.slice.call(arguments));
        timer = null; // 关键代码
      }, ms); 
    }
  }
}
```

下面是非定时器版本。

```javascript
function throttle(func, ms) {
  let lastRan;
  return function() {
    if (!lastRan || Date.now() - lastRan >= ms) {
      func.apply(this, Array.prototype.slice.call(arguments));
      lastRan = Date.now();
    }
  }
}
```

```javascript
export function useThrottle(value, ms = 0) {
  const timerRef = useRef();
  const [state, setState] = useState(value);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        setState(value);
        timerRef.current = null;
      }, ms);
    }
    
    return () => clearTimer();
  }, [value, ms, clearTimer]);

  return [state, clearTimer];
}
```

```javascript
export function useThrottleFn(fn, ms = 0, deps = []) {
  const timerRef = useRef();
  const [state, setState] = useState();

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const throttle = useCallback((...args) => {
    if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        setState(fn(...args));
        timerRef.current = null;
      }, ms);
    }
  }, [fn, ms]);

  useEffect(() => {
    return () => clearTimer();
  }, deps);

  return [state, throttle, clearTimer];
}
```

下面是两个使用的例子。

```jsx
// 基础用法
const throttledScroll = throttle(() => {
  // 滚动事件触发
}, 100);

// React Hook 用法
function ScrollComponent() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [throttledPosition] = useThrottle(scrollPosition, 100);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div>
      <p>当前滚动位置: {scrollPosition}</p>
      <p>节流后的位置: {throttledPosition}</p>
    </div>
  );
}
```

## 三、参考

- [防抖，MDN](https://developer.mozilla.org/zh-CN/docs/Glossary/Debounce)
- [节流，MDN](https://developer.mozilla.org/zh-CN/docs/Glossary/Throttle)
