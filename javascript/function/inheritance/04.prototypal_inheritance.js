/*
`原型式`继承

这种方式本质是对父类对象（person）执行了一次浅拷贝。

优点：能够实现父类中属性和方法的继承。
缺点：
  1. 无法传递参数；
  2. 父类对象中的引用属性会被所有字类实例共享。

这种实现方式跟使用 `Object.create()` 方式效果一样。将下边的 `create()` 函数替换为 `Object.create()` 会得到同样的效果。

这种方式适合不需要单独创建构造函数，但仍然需要在对象间共享信息的场合。但注意：引用类型的属性会被所有实例对象共享。
*/

// 关键代码
// 本质上，create() 对传入的对象执行了一次浅复制
function create(obj) {
  function F() {}
  F.prototype = obj;
  return new F();
}

const person = {
  name: 'Nicholas',
  friends: ['Shelby', 'Court', 'Van'],
  sayName() {
    console.log(this.name);
  }
};

/*
每次执行 create() 方法，传入的是同一个 person 对象，这意味着 person 对象中的引用类型属性会被所有实例共享，
也就是对 person 对象执行了浅拷贝操作。
*/

const anotherPerson = create(person);
anotherPerson.name = 'Grey';
anotherPerson.friends.push('Rob');
anotherPerson.sayName();

const yetAnotherPerson = create(person);
yetAnotherPerson.name = 'Linda';
yetAnotherPerson.friends.push('Barbie');
yetAnotherPerson.sayName();

console.log(person.friends);
