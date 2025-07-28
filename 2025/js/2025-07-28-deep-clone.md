# 深拷贝

## 介绍

## `JSON.stringify()`

## `structuredClone()`

## 类型判断，实现深拷贝

```javascript
const typeOf = require('../../_internals/utils/type-of');

function deepClone(obj, cloneMap = new WeakMap()) {
  if (obj == null 
    || Number.isNaN(obj) 
    || typeof obj !== 'object') {
      return obj;
    };

  if (cloneMap.has(obj)) {
    return cloneMap.get(obj);
  }

  let clone;

  switch (typeOf(obj)) {
    case 'array': {
      clone = [];
      cloneMap.set(obj, clone);
      for (let index = 0; index < obj.length; index++) {
        clone[index] = deepClone(obj[index], cloneMap);
      }
    }
    break;
    case 'function':
      clone = obj;
      break;
    case 'date':
      clone = new Date(obj.getTime());
      break;
    case 'regexp':
      clone = new RegExp(obj.source, obj.flags);
      break;
    case 'set': {
      clone = new Set();
      cloneMap.set(obj, clone);
      for (const item of obj) {
        clone.add(deepClone(item));
      }
    }
    break;
    case 'map': {
      clone = new Map();
      cloneMap.set(obj, clone);
      for (const [key, item] of obj.entries()) {
        clone.set(key, deepClone(item, cloneMap));
      }
    }
    break;
    default:
      clone = Object.create(Object.getPrototypeOf(obj));  
      cloneMap.set(obj, clone);

      const descriptors = {};
      const keys = Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj));
      
      for (const key of keys) {
        const desc = Object.getOwnPropertyDescriptor(obj, key);
        if (desc.value) {
          desc.value = deepClone(desc.value, cloneMap)
        }
        descriptors[key] = desc;
      }

      Object.defineProperties(clone, descriptors);
  }

  return clone;
}
```

```javascript
const foo = {
  a: null,
  b: undefined,
  c: Number.NaN,
  d: true,
  e: 123,
  f: 0xBC,
  g: 'foo',
  h: 123n,
  i: Symbol('foo'),
  j: [
    true,
    123,
    'foo',
    ['a', { 'b': 'foo' }],
  ],
  j: {
    a: true,
    b: 123,
    c: 'foo',
    d: [123],
    e: {
      f: 'foo',
    },
  },
  k: new Set([true, 123, 'foo']),
  l: new Map([
    ['a', true],
    ['b', 123],
    ['c', 'foo'],
  ]),
  m (name) {
    this.name = name;
  },
  [Symbol('foo')]: 'foo symbol',
};

foo.x = foo;
foo.y = foo.j;
foo.z = {
  bar: 'bar',
};

console.log(deepClone(foo));
```

```text
<ref *1> {
  a: null,
  b: undefined,
  c: NaN,
  d: true,
  e: 123,
  f: 188,
  g: 'foo',
  h: 123n,
  i: Symbol(foo),
  j: { a: true, b: 123, c: 'foo', d: [ 123 ], e: { f: 'foo' } },
  k: Set(3) { true, 123, 'foo' },
  l: Map(3) { 'a' => true, 'b' => 123, 'c' => 'foo' },
  m: [Function: m],
  x: [Circular *1],
  y: { a: true, b: 123, c: 'foo', d: [ 123 ], e: { f: 'foo' } },
  z: { bar: 'bar' },
  [Symbol(foo)]: 'foo symbol'
}
```

## 参考

- [JSON.stringify()，MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
- [structuredClone()，MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/structuredClone)
