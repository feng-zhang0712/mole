/*
`组合`继承

含义：将原型链和借助构造函数的形式组合起来，从而发挥两者的长处。使用原型链实现对原型属性和方法的继承，借助构造函数实现对实例属性的继承。

优点：即能继承父类的实例属性，又能继承父类原型上的属性和方法。
缺点：
  1. 父类构造函数要调用两次（一次在创建字类原型时，一次在子类构造函数中调用）；
  2. 通过这种方式创建的子类实例，父类实例上的属性会同时存在于子类实例以及其 [[Prototype]] 对象上，这是两次调用 SuperType 构造函数的结果（下面的例子中是 name 和 colors 属性）。

实际上，父类实例上的属性，不应该出现在子类的 [[Prototype]] 对象上，出现这个问题的根本原因，是子类的 constructor 构造函数，被指向了父类。下边要讲到的`寄生式组合`继承跟这种方式类似，但是子类的构造函数就正确的指向了子类。
*/

function SuperType(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}

SuperType.prototype.sayName = function() {
  console.log(this.name);
}

function SubType(name, age) {
  // 关键代码：继承实例属性（第二次调用 SuperType）
  SuperType.call(this, name);
  this.age = age;
}

// 关键代码：继承方法
SubType.prototype = new SuperType(); // 第一次调用 SuperType

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
console.log(ins1);
console.log(ins2);