function deepClone(obj, hash = new WeakMap()) {
  // 处理 null 或者不是对象的情况
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理 Date
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // 处理 RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  // 处理 Map
  if (obj instanceof Map) {
    const result = new Map();
    obj.forEach((value, key) => {
      result.set(deepClone(key, hash), deepClone(value, hash));
    });
    return result;
  }

  // 处理 Set
  if (obj instanceof Set) {
    const result = new Set();
    obj.forEach(value => {
      result.add(deepClone(value, hash));
    });
    return result;
  }

  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  // 处理普通对象和数组
  const result = Array.isArray(obj) ? [] : {};
  hash.set(obj, result);

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = deepClone(obj[key], hash);
    }
  }

  return result;
}

// 测试
const obj = {
  number: 123,
  string: 'Hello',
  date: new Date(),
  regex: /test/ig,
  array: [1, 2, 3],
  nested: {
    a: 1,
    b: 2
  },
  map: new Map([
    ['key1', 'value1'],
    ['key2', 'value2']
  ]),
  set: new Set([1, 2, 3])
};

obj.obj = obj; // 循环引用

const clonedObj = deepClone(obj);

console.log(clonedObj);
