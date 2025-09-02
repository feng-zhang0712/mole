# 循环引用检测

## 一、什么是循环应用？

循环应用指的是，对象中的某个属性引用了自身，或者两个对象中的属性，相互引用彼此。循环引用的对象，会导致使用引用计数方式管理内存的引擎，无法回该收对象占用的内存。

## 二、循环引用检测

### 2.1 JSON.stringify

`JSON.stringify()` 方法用于对参数进行序列化，如果被序列化的对象中有循环引用的属性，就会报错。可以利用这个特性，检测对象中是否有循环应用的对象。

```javascript
function hasCycleReference(obj) {
  if (typeof obj == null || typeof obj !== 'object') {
    return false;
  }

  try {
    JSON.stringify(obj)
  } catch (error) {
    if (error.name === TypeError && error.message.includes('circular')) {
      return true;
    }

    throw error;
  }

  return false;
}
```

### 2.2 WeakSet

WeakSet 是 ES6 中新增的一种数据结构，相比于 Set，WeakSet 中存储的对象，不会影响系统的垃圾回收。

```javascript
function hasCycleReference(obj, visited = new WeakSet()) {
  if (typeof obj == null || typeof obj !== 'object') {
    return false;
  }

  if (visited.has(obj)) {
    return true;
  }

  visited.add(obj);

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (hasCycleReference(item, visited)) {
        return true;
      }
    }
  } else {
    for (const key of Reflect.ownKeys(obj)) {
      if (hasCycleReference(obj[key], visited)) {
        return true;
      }
    }
  }

  visited.delete(obj);
  
  return false;
}
```

循环引用检测，除了使用 WeakSet，还可以使用 WeakMap、Map、数组等，不过他们的实现思路都一样。

### 2.3 WeakMap + 路径记录

缓存检测结果，并记录对象访问路径。

```javascript
function hasCycleReference(obj, visited = new WeakMap(), path = '') {
  if (obj == null || typeof obj !== 'object') {
    return { hasCycle: false, path: '' };
  }

  if (visited.has(obj)) {
    return { hasCycle: true, path: visited.get(obj) };
  }

  visited.set(obj, path);

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const result = hasCycleReference(
        obj[i],
        visited,
        `${path}[${i}]`,
      );
      if (result.hasCycle) {
        return result;
      }
    }
  } else {
    for (const key of Reflect.ownKeys(obj)) {
      const result = hasCycleReference(
        obj[key],
        visited,
        `${path}.${String(key)}`,
      );
      if (result.hasCycle) {
        return result;
      }
    }
  }

  return { hasCycle: false, path: '' };
}
```

## 三、优化措施

### 异步检测

异步检测主要是为了避免对大对象进行递归遍历时带来的性能问题，方法是将检测操作放在 `setTimeout` 中，或者使用 MessageChannel 之类的 API。

```javascript
function detectCycleAsync(obj) {
  return new Promise(resolve => {
    setTimeout(() => resolve(hasCycleReference(obj)), 0);
  });
}
```

下面是使用 MessageChannel 的实现方式。

```javascript
function detectCycleAsync(obj) {
  return new Promise(resolve => {
    const channel = new MessageChannel();
    channel.port1.onmessage = function () {
      resolve(hasCycleReference(obj));
      channel.port1.close();
    }
    channel.port2.postMessage(undefined);
  });
}

detectCycleAsync({}).then(hasCycle => console.log(hasCycle));
```
