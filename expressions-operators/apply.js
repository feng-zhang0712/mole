Function.prototype.myApply = function(context, args) {
  if (typeof this !== 'function') {
    throw new TypeError('Not callable');
  }

  context = context || globalThis; // 处理 context 为 null 或 undefined 的情况
  const fnSymbol = Symbol('fn'); // 创建一个唯一的属性名，避免覆盖 context 上的属性
  context[fnSymbol] = this; // 将函数赋值给 context 的属性

  const result = context[fnSymbol](...(args || [])); // 使用 context 调用函数
  delete context[fnSymbol]; // 删除临时属性

  return result; // 返回函数执行结果
};

// 测试
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}
