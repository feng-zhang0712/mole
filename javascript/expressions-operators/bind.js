Function.prototype.myBind = function(context, ...args) {
  if (typeof this !== 'function') {
    throw new TypeError('Not callable');
  }

  const self = this; // 保存原函数的引用

  return function F() {
    // 如果作为构造函数使用，则使用新创建的实例作为 this
    if (this instanceof F) {
      return new self(...args);
    }
    // 普通调用时，使用指定的 context
    return self.apply(context, args);
  };
};

// 测试
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const person = { name: 'John' };
const greetPerson = greet.myBind(person, 'Hello', '!');
console.log(greetPerson()); // 输出: "Hello, John!"
