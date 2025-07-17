/*
使用 ES6 新增的 class（类）创建对象


使用 new 调用类的构造函数会执行如下操作。 
  1. 在内存中创建一个新对象。 
  2. 这个新对象内部的[[Prototype]]指针被赋值为构造函数的 prototype 属性。 
  3. 构造函数内部的 this 被赋值为这个新对象（即 this 指向新对象）。 
  4. 执行构造函数内部的代码（给新对象添加属性）。 
  5. 如果构造函数返回非空对象，则返回该对象；否则，返回刚创建的新对象。

参考：[Class 的继承](https://es6.ruanyifeng.com/#docs/class-extends)
*/

class SuperType {
  constructor(name) {
    this.name = name;
    this.colors = ['red', 'blue', 'green'];
  }

  static foo = 100;
  static getFoo() {
    return this.foo;
  }

  sayName() {
    console.log(this.name);
  }
}

class SubType extends SuperType {
  constructor(name, age) {
    super(name);
    this.age = age;
  }

  static foo = 99;

  sayAge() {
    console.log(this.age);
  }
}

const sub = new SubType('Nicholas', 27);
console.log(SubType.getFoo());
sub.sayName();
sub.sayAge();

/*
Class 作为构造函数的语法糖，同时有 __proto__ 属性和 prototype 属性，因此同时存在两条继承链。
  1. 子类的 __proto__ 属性，表示构造函数的继承，总是指向父类；
  2. 子类 prototype.__proto__ 属性，表示方法的继承，总是指向父类的 prototype 属性。
*/

SubType.__proto__ === SuperType; // true
SubType.prototype.__proto__ === SuperType.prototype; // true

// 这样的结果是因为，类的继承是按照下面的模式实现的。
Object.setPrototypeOf(SubType, SuperType);
Object.setPrototypeOf(SubType.prototype, SuperType.prototype);
