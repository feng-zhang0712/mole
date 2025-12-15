# 对象的继承

## 一、介绍

## 二、继承的多种实现

### 2.1 `构造函数`方式实现继承

借助 `构造函数`（Constructor）的方式实现继承，是最简单的继承方式。

这种方式的优点是可以向父类的构造函数传递参数，缺点是只能继承父类的实例属性和方法，不能继承原型上的属性和方法，无法实现复用。

```javascript
function SuperType(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
  this.sayName = function() {
    console.log(this.name);
  }
}

function SubType(name, age) {
  // 关键代码：继承 SuperType
  SuperType.call(this, name);
  this.age = age;
}
```

```javascript
const ins = new SubType('Jack', 29);
ins.colors.push('black');
ins.name // Jack
ins.age // 29
ins.colors // ['red', 'blue', 'green', 'black']
```

### 2.2 `原型链`方式实现继承

使用 `原型链`（Prototype）的方式实现继承，优点是子类可以继承父类实例的属性和方法，以及父类原型上的属性和方法。

缺点也很明显。

- 不能向父类的构造函数传递参数；
- 定义在原型中的**引用类型的属性**，会被所有的子类实例共享。

```javascript
function SuperType() {
  this.property = true;
  this.colors = ['red', 'blue', 'green'];
  this.sayIt = function() {
    console.log(this.property);
  }
}
SuperType.prototype.getSuperValue = function() {
  return this.property;
}

function SubType() {
  this.subProperty = false;
}

// 关键代码：继承 SuperType
SubType.prototype = new SuperType();

SubType.prototype.getSubValue = function() {
  return this.subProperty;
}
```

上面代码中，将一个父类的实例对象，复制到了 `SubType.prototype` 上，从而实现了继承父类实例以及原型上的属性和方法。此时，子类的 `constructor` 属性指向 `SuperType`，并且所有子类实例共享同一个对象，也就是 `(new SubType()).__proto__ === SubType.prototype === (new SubType()).__proto__`。

下面的图片，显示了执行 `const sub = new SubType();` 时，`sub` 对象的结构。

![原型式继承中，子类实例对象的结构](/2025/assets/instance-structure-while-using-prototype-inheritance.png)

从上面可以看出，原型链的指向是，`sub` -> `SubType` -> `SuperType` -> `Object` -> `null`。

对于构造函数来说，`sub.constructor === SuperType`，并且 `SubType.prototype.constructor = SuperType.prototype.constructor`。

```javascript
const ins1 = new SubType();
ins1.colors.push('black');
ins1.colors // ['red', 'blue', 'green', 'black']

const ins2 = new SubType();
ins2.colors // ['red', 'blue', 'green', 'black']
```

从上面的代码可以看出，所有 `SubType` 的实例，都共享了父类实例对象的 `colors` 属性。

### 2.3 组合继承

`组合`继承（Combination Inheritance），是指将原型链和借助构造函数的形式组合起来，从而发挥两者的长处。使用原型链实现对原型属性和方法的继承，借助构造函数实现对实例属性的继承。

优点是：

- 可以向父类的构造函数传递参数；
- 即能继承父类的实例属性，又能继承父类原型上的属性和方法。

缺点是：

- 父类构造函数要调用两次（一次在创建字类原型时，一次在子类构造函数中调用）；
- 通过这种方式创建的子类实例，父类实例上的属性会同时存在于子类实例以及其 `[[Prototype]]` 对象上，这是两次调用 `SuperType` 构造函数的结果（下面的例子中是 `name` 和 `colors` 属性）。

```javascript
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
// 第一次调用 SuperType
SubType.prototype = new SuperType();
SubType.prototype.constructor = SubType;

SubType.prototype.sayAge = function() {
  console.log(this.age);
}
```

```javascript
const ins1 = new SubType('Nicholas', 29);
ins1.colors.push('black');
ins1.colors // ['red', 'blue', 'green', 'black']


const ins2 = new SubType('Grey', 27);
ins2.colors // ['red', 'blue', 'green']
```

下面的图片，显示了执行 `const sub = new SubType('Grey', 27);` 时，`sub` 对象的结构。

![原型式继承中，子类实例对象的结构](/2025/assets/instance-structure-while-using-combination-inheritance.png)

从上面可以看出，`name` 和 `colors` 属性同时存在于 `sub` 对象，以及它的原型对象上。

### 2.4 原型式继承

`原型式`继承（Prototypal Inheritance）的原理，与使用 `Object.create()` 方式类似，本质是对父类对象执行了一次浅拷贝。

这种方式的优点是，能够实现父类中属性和方法的继承。缺点是：

- 由于父类没有构造函数，所以无法传递参数；
- 父类对象中的引用属性被所有子类实例共享。

这种方式适合不需要单独创建构造函数，但仍然需要在对象间共享信息的场合。但注意：引用类型的属性会被所有实例对象共享。

```javascript
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
```

上面代码中，每次执行 `create()` 方法，传入的是同一个 `person` 对象，这意味着 `person` 对象中的引用类型属性会被所有实例共享，
也就是对 `person` 对象执行了浅拷贝操作。

```javascript
const ins1 = create(person);
ins1.friends // ['Shelby', 'Court', 'Van']

const ins2 = create(person);
ins2.friends.push('Rob');

ins1.friends // ['Shelby', 'Court', 'Van', 'Rob']
ins2.friends // ['Shelby', 'Court', 'Van', 'Rob']
person.friends // ['Shelby', 'Court', 'Van', 'Rob']
```

### 2.5 寄生式继承

`寄生式`继承（Parasitic Inheritance），类似于寄生构造函数和工厂模式，创建一个实现继承的方法，以某种方式增强对象，然后返回这个对象。

这种方式优点是，能够实现对父类（下边例子是 `person` 对象）中属性和方法的继承，同时可以自己添加属性和方法。缺点是：

- 由于父类没有构造函数，所以无法传递参数；
- 父类中的引用属性会被所有字类实例共享。通过这种方式给对象添加方法，会导致方法难以重用（且无法传递参数）。

```javascript
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
```

```javascript
const ins1 = clone(person);
ins1.friends.push('Grey');
ins1.friends // ['Shelby', 'Court', 'Van', 'Grey']

const ins2 = clone(person);
ins2.friends // ['Shelby', 'Court', 'Van', 'Grey']
```

寄生式继承同样适合主要关注对象，而不在乎类型和构造函数的场景。`create()` 函数不是寄生式
继承所必需的，任何返回新对象的函数都可以在这里使用。

### 2.6 寄生组合式继承

`寄生组合式`继承（Parasitic Inheritance Combination）是指通过执行父类的构造函数继承属性，但使用混合式原型链继承方法。基本思路是不通过调用父类构造函数给子类原型赋值，而是取得父类原型的一个副本。本质是使用寄生式继承来继承父类原型，然后将返回的新对象赋值给子类原型。

这种方式优点是：

- 可以向父类的构造函数传递参数。
- 即能继承父类的实例属性，又能继承父类原型上的属性和方法。

相比于其他几种方式，寄生组合式继承还有这些优点：

- 子类构造函数指向正常（指向子类自身，而不是父类）。
- 父类构造函数只执行一次，避免了 `SubType.prototype` 上不必要也用不到的属性。
- 原型链仍然保持不变，因此 `instanceof` 操作符和 `isPrototypeOf()` 方法正常有效。

寄生式组合继承的核心逻辑：

1. 创建父类原型的一个副本；
2. 给返回的 `prototype` 对象设置 `constructor` 属性，解决由于重写原型导致默认 `constructor` 丢失的问题。
3. 将新创建的对象赋值给子类型的原型。

```javascript
function create(obj) {
  function F() {}
  F.prototype = obj;
  return new F();
}

// 关键代码
function extend(subType, superType) {
  const prototype = Object.create(superType.prototype); // 这里也可以使用 create(superType.prototype)
  prototype.constructor = subType; // 设置 subType.prototype.constructor 指向自身的构造函数
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

extend(SubType, SuperType);

SubType.prototype.sayAge = function() {
  console.log(this.age);  
}
```

```javascript
const ins1 = new SubType('Nicholas', 29);
ins1.colors.push('black');
ins1.colors // ['red', 'blue', 'green', 'black']

const ins2 = new SubType('Grey', 27);
ins2.colors // ['red', 'blue', 'green']
```

从上面的代码可以看出，寄生组合式继承具有其它方式的优点，但是又没有他们的缺点，是一种相对理想的继承方式。

### 2.7 Class 继承

ES6 新增了 Class（类），使用类中的 `extents` 关键字，可以很方便的实现继承。

```javascript
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
```

Class 作为构造函数的语法糖，同时有 `__proto__` 属性和 `prototype` 属性，因此同时存在两条继承链。

- 子类的 `__proto__` 属性，表示构造函数的继承，总是指向父类；
- 子类 `prototype.__proto__` 属性，表示方法的继承，总是指向父类的 `prototype` 属性。

```javascript
SubType.__proto__ === SuperType; // true
SubType.prototype.__proto__ === SuperType.prototype; // true

// 这样的结果是因为，类的继承是按照下面的模式实现的。
Object.setPrototypeOf(SubType, SuperType);
Object.setPrototypeOf(SubType.prototype, SuperType.prototype);
```

## 三、参考

- [Inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain)，MDN
- [JavaScript 高级程序设计](https://book.douban.com/subject/35175321/)，Matt Frisbie
- [Class 的继承](https://es6.ruanyifeng.com/#docs/class-extends)，阮一峰
