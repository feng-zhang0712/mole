/*
`组合`继承

含义：将原型链和借助构造函数的形式组合起来，从而发挥两者的长处。使用原型链实现对原型属性和方法的继承，借助构造函数实现对实例属性的继承。

优点：即能继承父类的实例属性，又能继承父类原型上的属性和方法
缺点：父类构造函数要调用两次（一次在创建字类原型时，一次在子类构造函数中调用）。
*/

// 注意：通过这种方式创建的子类实例，父类实例上的属性会同时存在于实例自身以及其 [[Prototype]] 对象上，这是两次调用 SuperType 构造函数的结果。（下面的例子中是 name 和 colors 属性）

function SuperType(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}

SuperType.prototype.sayName = function() {
  console.log(this.name);
}

function SubType(name, age) {
  // 继承实例属性（第二次调用 SuperType）
  SuperType.call(this, name);
  this.age = age;
}

// 继承方法
SubType.prototype = new SuperType(); // 第一次调用 SuperType

SubType.prototype.sayAge = function() {
  console.log(this.age);
}

const ins1 = new SubType('Nicholas', 29);
ins1.colors.push('black');
console.log(ins1.colors);
ins1.sayName();
ins1.sayAge();


const ins2 = new SubType('Grey', 27);
console.log(ins2.colors);
ins2.sayName();
ins2.sayAge();
