export default function throttle(func, ms) {
  let lastRan;
  return function() {
    if (!lastRan || Date.now() - lastRan >= ms) {
      func.apply(this, [].slice.call(arguments));
      lastRan = Date.now();
    }
  }
}
