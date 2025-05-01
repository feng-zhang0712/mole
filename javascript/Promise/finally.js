Promise.prototype.finally = function(callback) {
  // 保存原始 Promise 的 this 上下文
  let P = this.constructor;
  
  // 返回一个新的 Promise
  return this.then(
    // 如果原始 Promise resolve
    value => P.resolve(callback()).then(() => value),
    // 如果原始 Promise reject
    reason => P.resolve(callback()).then(() => { throw reason; })
  );
};
