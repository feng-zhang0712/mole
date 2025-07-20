/*

防抖指的是在特定时间间隔内忽略发生得过于接近的操作，将它们合并为一次调用。即如果在指定的时间间隔之内，尝试多次执行某个动作，则只有最后一次执行有效。

防抖的典型用例是响应用户输入。当用户正在输入时不应执行其他操作，从而避免让界面变得卡顿。当用户暂停输入时，我们就可以开始处理输入（如过滤结果、给出建议等）。

参考：
  - [MDN - 防抖](https://developer.mozilla.org/zh-CN/docs/Glossary/Debounce)
*/

function debounce(func, wait) {
  let timer;
  return function() {
    // 关键代码
    if (timer) {
     clearTimeout(timer); 
    }
    
    const _this = this;
    timer = setTimeout(function() {
      func.call(_this, Array.prototype.slice.call(arguments));
      timer = null;
    }, wait);
  }
}
