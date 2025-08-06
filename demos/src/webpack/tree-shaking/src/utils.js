// 纯函数 - 可以被 Tree Shaking
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}

export function divide(a, b) {
  return a / b;
}

// 有副作用的代码会影响 Tree Shaking
console.log('Side effect code.');
window.baz = 'Global side effect variable.';

// 使用 /*#__PURE__*/ 注释标记纯函数，使其可以被放心地删除
/*#__PURE__*/ console.log('Side effect code, will be removed.');

// 默认导出，不推荐用于 Tree Shaking
// export default {
//   add,
//   subtract,
//   multiply,
//   divide,
// }; 
