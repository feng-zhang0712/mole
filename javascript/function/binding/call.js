// 当通过 `obj.fn()` 或者 `obj['fn']()` 调用对象中的方法时，方法中的 this 指向对象本身。

// 非 ES6 实现
if (!('call' in Function.prototype)) {
  Object.defineProperty(Function.prototype, 'call', {
    value: function () {
      if (typeof this !==  'function') {
        throw Error('Not a function.');
      }

      const args = Array.from(arguments);
      let context = args.shift();
      context = Object(context) || globalThis;

      let uniqueProp = 'call_' + new Date().getTime();
      while (context[uniqueProp]) {
        uniqueProp = 'call_' + new Date().getTime();
      }

      // 绑定 this，此时 this 指向调用 call 方法的函数
      context[uniqueProp] = this;

      const evalArgs = [];
      for (let index = 0; index < args.length; index++) {
        evalArgs.push('args[' + index +']');
      }

      const result = eval('context[uniqueProp](' +  evalArgs.join(',') +')');
      delete context[uniqueProp];

      return result;
    },
    writable: true,
    enumerable: false,
    configurable: true,
  })
}

// ES6 实现
if (!('call' in Function.prototype)) {
  Object.defineProperty(Function.prototype, 'call', {
    value: function () {
      if (typeof this !==  'function') {
        throw Error('Not a function.');
      }

      const args = Array.from(arguments);
      let context = args.shift();
      context = context ? Object(context) : globalThis;

      const symbol = Symbol('call');
      // 绑定 this
      context[symbol] = this;
      const result = context[symbol](...args);
      delete context[symbol];
      
      return result;
    },
    writable: true,
    enumerable: false,
    configurable: true,
  })
}

console.log(Object.getOwnPropertyDescriptors(Function.prototype));
