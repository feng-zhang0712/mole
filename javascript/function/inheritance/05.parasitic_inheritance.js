/*
`寄生式`继承

思路：类似于寄生构造函数和工厂模式，创建一个实现继承的方法，以某种方式增强对象，然后返回这个对象。

优点：能够实现对父类（下边例子是 person 对象）中属性和方法的继承，同时可以自己添加属性和方法。
缺点：
  1. 无法传递参数；
  2. 父类中的引用属性会被所有字类实例共享。通过这种方式给对象添加方法，会导致方法难以重用（且无法传递参数）。
*/

function create(obj) {
  function F() {}
  F.prototype = obj;
  return new F();
}

// 关键代码
function clone(original) {
  const obj = create(original);
  obj.sayHi = function() {
    console.log('Hi');
  }
  return obj;
}

const person = {
  name: 'Nicholas',
  friends: ['Shelby', 'Court', 'Van'],
  sayName() {
    console.log(this.name);
  }
};

/*
这个例子基于 person 对象返回了一个新对象。新返回的 anotherPerson 对象具有 person 的所
有属性和方法，还有一个新方法叫 sayHi()。 

寄生式继承同样适合主要关注对象，而不在乎类型和构造函数的场景。create() 函数不是寄生式
继承所必需的，任何返回新对象的函数都可以在这里使用。 
*/

const person1 = clone(person);
person1.friends.push('Grey');
person1.sayHi();
person1.sayName();
console.log(person1.friends);

const person2 = clone(person);
console.log(person2.friends);