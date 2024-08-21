const test = {  person: { name: 'Tom' } };
const data = {  a: "123", 
  b: 123, 
  c: true, 
  d: [43, 2], 
  e: undefined,
  f: null,
  g: function() {    console.log("g");  },
  h: new Set([3, 2, null]),
  i: Symbol("fsd"),
  j: test,
  k: new Map([    ["name", "张三"],    ["title", "Author"]  ])
};

data.L = data;

function deepClone(obj, hash = new WeakMap()) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (hash.has(obj)) {
    return hash.get(obj);
  }

  const result = Array.isArray(obj) ? [] : {};
  hash.set(obj, result);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = deepClone(obj[key], hash);
    }
  }
  
  return result;
}

const deepCopy = deepClone(data);
console.log(deepCopy);