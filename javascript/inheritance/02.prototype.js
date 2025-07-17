/*
`原型链`方式实现继承

优点：子类可以继承父类的属性和方法，以及父类原型上的属性和方法。
缺点：
  1. 不能向父类的构造函数传递参数；
  2. 定义在原型中的引用类型的属性，会被所有的子类实例共享。
*/

function SuperType() {
  this.property = true;
  this.colors = ['red', 'blue', 'green'];
  // 父类实例的方法属性也会被子类继承
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

/*
  关键代码：继承 SuperType

  1. 等号右边实例对象的属性和方法，挂载到了 `SubType.prototype`
  2. 实例的 constructor 属性指向 SuperType
  3. 所有实例共享同一个对象 (new SubType()).__proto__ === (new SubType()).__proto__
*/
SubType.prototype = new SuperType();

SubType.prototype.getSubValue = function() {
  return this.subProperty;
}

/*
分析：
  const ins = new SubType();
  1. SubType 创建的实例对象 ins 只有一个实例属性：subProperty
  2. ins.__proto__（即 SubType.prototype）指向一个 SuperType 类型的实例，前者有四个属性：property/colors/sayIt 以及定义在它原型上的 getSubValue 方法
  3. ins 的打印结果如下：

  {
    subProperty: false,

    // `SubType.prototype = new SuperType();`
    __proto__: {
      property: true,
      colors: ['red', 'blue', 'green'],
      sayIt() {},
      getSubValue() {},
      __proto__: {
        constructor: SuperType
        getSuperValue: {},
      }
    },
  }

  原型链：ins => SubType.prototype => SuperType.prototype => Object.prototype => null
  构造函数：
    1. ins.constructor === SuperType
    2. SubType.prototype.constructor = SuperType.prototype.constructor
*/

const ins1 = new SubType();
ins1.colors.push('black');
console.log(ins1.getSuperValue());
console.log(ins1.colors);

const ins2 = new SubType();
console.log(ins2.getSuperValue());
console.log(ins2.colors);
