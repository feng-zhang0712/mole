/*
JavaScript 的动态特性允许任何对象通过原型链访问 Function.prototype 的方法。由于 `bind` 方法只能被函数调用，方法中最开始的判断，是为了防止以下几种情况的调用。
  1. 非函数对象调用：
    const obj = {};
    obj.bind = Function.prototype.bind;
    obj.bind();
  2. 通过 `call` 或 `apply` 改变 `this`: `Function.prototype.bind.call({});`
  3. 意外的上下文丢失：
    const bind = Function.prototype.bind;
    bind();
*/

if (!('bind' in Function.prototype)) {
  Object.defineProperty(Function.prototype, 'bind', {
    value: function() {
      if (typeof this !== 'function') {
        throw new TypeError('Not a function');
      }

      const args = Array.from(arguments);
      let context = args.shift();
      context = context ? Object(context) : globalThis;

      const fn = this;
      const noop = function() {};
      const bound = function() {
        return fn.apply(this instanceof noop ? this : context, args.concat(...arguments));
      }

      // 通过下边的方式实现继承，能够防止 bound 和 fn 的实例共用同一个原型对象。
      // 否则，如果后续对 bound.prototype 做修改，会影响到 fn.prototype，导致原型链被污染，产生副作用。
      noop.prototype = fn.prototype;
      bound.prototype = new noop();
      
      return bound;
    },
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

// 简化版
Function.prototype.myBind = function(context, ...boundArgs) {
  if (typeof this !== 'function') {
    throw new TypeError('Not a function');
  }
  const fn = this;
  const noop = function() {};
  const bound = function(...args) {
    const ctx = this instanceof noop ? this : context;
    return fn.apply(ctx, boundArgs.concat(args));
  };
  noop.prototype = fn.prototype;
  bound.prototype = new noop();
  return bound;
};