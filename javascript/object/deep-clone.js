// https://grok.com/share/bGVnYWN5_4e441247-ffb7-4f5e-bccc-618fc616d997

function deepClone(obj, cloneMap = new WeakMap()) {
  // 处理基本类型（null、undefined、boolean、number、string、symbol）
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 如果对象已被克隆过，直接返回已有的克隆
  if (cloneMap.has(obj)) {
    return cloneMap.get(obj);
  }

  let clone;

  if (Array.isArray(obj)) {
    clone = [];
    cloneMap.set(obj, clone);
    for (let i = 0; i < obj.length; i++) {
      clone[i] = deepClone(obj[i], cloneMap);
    }
  } else if (obj instanceof Date) {
    clone = new Date(obj.getTime());
  } else if (obj instanceof RegExp) {
    clone = new RegExp(obj.source, obj.flags);
  } else if (obj instanceof Map) {
    clone = new Map();
    cloneMap.set(obj, clone);
    for (let [key, value] of obj) {
      clone.set(key, deepClone(value, cloneMap));
    }
  } else if (obj instanceof Set) {
    clone = new Set();
    cloneMap.set(obj, clone);
    for (let value of obj) {
      clone.add(deepClone(value, cloneMap));
    }
  } else if (typeof obj === 'function') {
    return obj;
  } else {
    // 处理普通对象（包括自定义类实例）

    clone = Object.create(Object.getPrototypeOf(obj));
    cloneMap.set(obj, clone);

    let descriptors = {};
    for (let key of Object.getOwnPropertyNames(obj)) {
      let desc = Object.getOwnPropertyDescriptor(obj, key);
      if (desc.value !== undefined) {
        desc.value = deepClone(desc.value, cloneMap);
      }
      descriptors[key] = desc;
    }

    for (let sym of Object.getOwnPropertySymbols(obj)) {
      let desc = Object.getOwnPropertyDescriptor(obj, sym);
      if (desc.value !== undefined) {
        desc.value = deepClone(desc.value, cloneMap);
      }
      descriptors[sym] = desc;
    }
    
    Object.defineProperties(clone, descriptors);
  }

  return clone;
}
