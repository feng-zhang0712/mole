// 借助 eval 函数实现
if (!('apply' in Function.prototype)) {
  Object.defineProperty(Function.prototype, 'apply', {
    value: function () {
      if (typeof this !==  'function') {
        throw Error('Not a function.');
      }

      let [context, args] = arguments;
      context = Object(context) || globalThis;
        
      let key = String(new Date().getTime());
      while (context[key]) {
        key = String(new Date().getTime());
      }
      
      context[key] = this; // 绑定 this：将函数赋值给context的临时属性
      const evalArgs = [];
      for (let i = 0; i < args.length; i++) {
        evalArgs.push('args[' + i + ']');
      }
      
      const result = eval('context[key](' + evalArgs.join(',') + ')');
      delete context[key];
      
      return result;
    },
    writable: true,
    enumerable: false,
    configurable: true,
  })
}

if (!('apply' in Function.prototype)) {
  Object.defineProperty(Function.prototype, 'apply', {
    value: function() {
      if (typeof this !==  'function') {
        throw Error('Not a function.');
      }

      const args = Array.from(arguments);
      let context = args.shift();
      context = context ? Object(context) : globalThis;
    
      const key = Symbol('key');
      context[key] = this; // 绑定 this
      const result = context[key](...args);
      delete context[key];
      
      return result;
    },
    writable: true,
    enumerable: false,
    configurable: true,
  })
}