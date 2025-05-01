// https://q.shanyue.tech/fe/js/3

function debounce(func, wait) {
  let timer;
  return function(...args) {
    const _this = this;

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(function () {
      func.apply(_this, args);
    }, wait);
  }
}

function throttle(func, wait) {
  let timer;
  return function(...args) {
    const _this = this;

    if (!timer) {
      timer = setTimeout(() => {
        func.apply(_this, args);
        timer = null;
      }, wait);
    }
  }
}

export { debounce, throttle }
