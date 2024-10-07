function debounce(func, wait) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  }
}

function debounce(func, wait, immediate) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    if (immediate) {
      func.apply(this, args);
    } else {
      timeout = setTimeout(() => {
        func.apply(this, args);
      }, wait);
    }
    
  }
}