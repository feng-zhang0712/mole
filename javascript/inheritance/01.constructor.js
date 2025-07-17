/*
`构造函数`方式实现继承

优点：可以向父类的构造函数传递参数。
缺点：只能继承父类的实例属性和方法，不能继承原型上的属性和方法，无法实现复用。
*/

function SuperType(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
  // 这种方式定义的是 this 实例对象上的属性，所以 sayName 方法属性也会被继承
  this.sayName = function() {
    console.log(this.name);
  }
}

function SubType(name, age) {
  // 关键代码：继承 SuperType 
  SuperType.call(this, name);
  this.age = age;
}

// ---

// const ins1 = new SubType('Jack', 29);
// ins1.colors.push('black');
// console.log(ins1.colors);

// const ins2 = new SubType('Tom', 27);
// console.log(ins2.colors);
