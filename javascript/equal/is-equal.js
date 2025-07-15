function isEqual(a, b, visited = new WeakMap()) {
  // 1. 严格相等比较（处理基本类型和相同引用）
  if (a === b) return true;

  // 2. 处理 null 和 undefined
  if (a == null || b == null) return a === b;

  // 3. 处理 NaN
  if (Number.isNaN(a) && Number.isNaN(b)) return true;

  // 4. 获取类型，确保类型一致
  const typeA = Object.prototype.toString.call(a);
  const typeB = Object.prototype.toString.call(b);
  if (typeA !== typeB) return false;

  // 5. 处理循环引用
  if (typeof a === 'object' || typeof a === 'function') {
    if (visited.has(a) && visited.get(a) === b) return true;
    visited.set(a, b);
  }

  // 6. 根据类型进行深度比较
  switch (typeA) {
    case '[object Array]': {
      if (a.length !== b.length) return false;
      return a.every((item, index) => isEqual(item, b[index], visited));
    }
    case '[object Object]': {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every(key => isEqual(a[key], b[key], visited));
    }
    case '[object Function]': {
      return a.toString() === b.toString();
    }
    case '[object Date]': {
      return a.getTime() === b.getTime();
    }
    case '[object RegExp]': {
      return a.source === b.source && a.flags === b.flags;
    }
    case '[object Set]': {
      if (a.size !== b.size) return false;
      const valuesA = Array.from(a.values());
      const valuesB = new Set(b);
      return valuesA.every(value => valuesB.has(value) && isEqual(value, value, visited));
    }
    case '[object Map]': {
      if (a.size !== b.size) return false;
      const entriesA = Array.from(a.entries());
      return entriesA.every(([key, value]) => isEqual(value, b.get(key), visited));
    }
    default: {
      // 基本类型已由 === 处理，其他类型（如 Symbol）直接比较
      return a === b;
    }
  }
}
