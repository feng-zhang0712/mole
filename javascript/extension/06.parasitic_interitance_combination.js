/*
`寄生式组合`继承

寄生式组合继承通过执行父类的构造函数继承属性，但使用混合式原型链继承方法。基本思路是不通过调
用父类构造函数给子类原型赋值，而是取得父类原型的一个副本。说到底就是使用寄生式继承来继承父
类原型，然后将返回的新对象赋值给子类原型。

优点：
  1. 子类构造函数指向正常（指向子类自身，而不是父类）。
  2. 父类构造函数只执行一次，避免了 SubType.prototype 上不必要也用不到的属性。
  3. 原型链仍然保持不变，因此 instanceof 操作符和 isPrototypeOf() 方法正常有效。

  这种方式跟`组合`继承类似，但是子类的构造函数不会被指向父类，而是子类自身，所以也就没有`组合`继承的缺点。
*/

/*
寄生式组合继承的核心逻辑：
  1. 创建父类原型的一个副本
  2. 给返回的 prototype 对象设置 constructor 属性，解决由于重写原型导致默认 constructor 丢失的问题
  3. 将新创建的对象赋值给子类型的原型
*/

function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}

// 关键代码
function inheritPrototype(subType, superType) {
  const prototype = object(superType.prototype);
  prototype.constructor = subType; // 这行代码是区别于`组合`继承的关键
  subType.prototype = prototype;
}

function SuperType(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}

SuperType.prototype.sayName = function() {
  console.log(this.name);
}

function SubType(name, age) {
  SuperType.call(this, name);
  this.age = age;
}

inheritPrototype(SubType, SuperType);

SubType.prototype.sayAge = function() {
  console.log(this.age);  
}

// ---

const ins1 = new SubType('Nicholas', 29);
ins1.colors.push('black');
console.log(ins1.colors);
ins1.sayName();
ins1.sayAge();


const ins2 = new SubType('Grey', 27);
console.log(ins2.colors);
ins2.sayName();
ins2.sayAge();
