function myNew(constructor, ...args) {
   // 1. 创建一个空对象
  const obj = {};

  // 2. 将该对象的原型指向构造函数的原型对象
  Object.setPrototypeOf(obj, constructor.prototype);

  // 或者，将 1、2 步合并。创建一个空对象，并将该对象的原型指向构造函数的原型对象
  // const obj = Object.create(constructor.prototype);

  // 3. 调用构造函数，并将 `this` 指向这个新创建的对象
  const result = constructor.apply(obj, args);

  // 4. 如果构造函数返回的是对象，则返回该对象；否则，返回新创建的对象
  return result instanceof Object ? result : obj;
}

// 测试

function Person(name) {
  this.name = name;
}

const person = myNew(Person, 'Tom');
console.log(person.name);