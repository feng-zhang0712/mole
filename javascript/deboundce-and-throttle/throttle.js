/*

节流（Throttling）最初指通过障碍物减缓流体流速。在编程中，它指的是减慢某个过程的速率，使某项操作只能以一定的频率执行。如果在一段时间内，某个动作频繁出发，则限制其在固定时间间隔内，只能执行一次。即限制动作，使其以固定的低频率触发。

节流的典型用例是与另一个持续更新的状态同步。比如监视窗口的 `resize` 事件和滚动条的 `scroll` 事件。

节流的关键是，如果触发器不存在，则创建触发器，并在触发器到期后清空定时器；如果存在，则不执行任何操作。

参考：
  - [MDN - 节流](https://developer.mozilla.org/zh-CN/docs/Glossary/Throttle)
*/

// 定时器版本
function throttle(func, wait) {
  let timer;
  return function() {
    if (!timer) { // 关键代码
      const _this = this;
      timer = setTimeout(() => {
        func.apply(_this, arguments);
        timer = null; // 关键代码
      }, wait); 
    }
  }
}

// 非定时器版本
function _throttle(func, wait) {
  let lastRan;
  return function() {
    if (!lastRan || Date.now() - lastRan >= wait) {
      func.apply(this, arguments);
      lastRan = Date.now();
    }
  }
}
