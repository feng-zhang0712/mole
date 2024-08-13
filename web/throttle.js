function throttle(func, wait) {
  let lastRan, timeout;
  return function(...args) {
    if (!lastRan) {
      timeout = setTimeout(() => {
        func.apply(this, args);
      }, wait);
      lastRan = Date.now();
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (Date.now() - lastRan < wait) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, wait - (Date.now() - lastRan));
    }
  }
}