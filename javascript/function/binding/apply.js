// 非 ES6 实现
if (!('apply' in Function.prototype)) {
  Object.defineProperty(Function.prototype, 'apply', {
    value: function () {
      if (typeof this !==  'function') {
        throw Error('Not a function.');
      }

      const args = Array.from(arguments);
      let context = args.shift();
      // 确保context存在，若为null或undefined则使用全局对象
      context = Object(context) || window;
        
      // 生成唯一属性名以避免冲突
      let uniqueProp = 'call_' + new Date().getTime();
      while (context[uniqueProp]) {
        uniqueProp = 'call_' + new Date().getTime();
      }
      
      // // 绑定 this：将函数赋值给context的临时属性
      context[uniqueProp] = this;
      
      // 获取参数（从第二个参数开始）
      const evalArgs = [];
      for (let i = 1; i < args.length; i++) {
        evalArgs.push('args[' + i + ']');
      }
      
      // 使用eval执行函数调用（ES3兼容方式）
      const result = eval('context[uniqueProp](' + evalArgs.join(',') + ')');
      
      // 删除临时属性
      delete context[uniqueProp];
      
      return result;
    },
    writable: true,
    enumerable: false,
    configurable: true,
  })
}

// ES6 实现
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
      // 绑定 this
      context[key] = this;
      const result = context[key](...args);
      delete context[key];
      
      return result;
    },
    writable: true,
    enumerable: false,
    configurable: true,
  })
}