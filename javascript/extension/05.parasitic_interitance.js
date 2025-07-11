/*
`寄生式`继承

思路：创建一个实现继承的方法，以某种方式增强对象，然后返回这个对象。

优点：
缺点：父类中的引用属性会被所有字类实例共享。通过这种方式给对象添加方法，会导致方法难以重用（且无法传递参数）。
*/

function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}

function createAnother(original) {
  const clone = object(original);
  clone.sayHi = function() {
    console.log('Hi');
  }
  return clone;
}

const person = {
  name: 'Nicholas',
  friends: ['Shelby', 'Court', 'Van'],
};

/*
这个例子基于 person 对象返回了一个新对象。新返回的 anotherPerson 对象具有 person 的所
有属性和方法，还有一个新方法叫 sayHi()。 

寄生式继承同样适合主要关注对象，而不在乎类型和构造函数的场景。object() 函数不是寄生式
继承所必需的，任何返回新对象的函数都可以在这里使用。 
*/

const person1 = createAnother(person);
person1.friends.push('Grey');
person1.sayHi();
console.log(person1.friends);

const person2 = createAnother(person);
console.log(person2.friends);