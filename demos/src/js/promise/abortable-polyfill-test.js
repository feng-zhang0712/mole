const promise = new Promise((resolve, reject, abort) => {
  const timeoutId = setTimeout(() => {
    resolve('success');
  }, 5000);

  // 监听abort信号
  abort(() => {
    clearTimeout(timeoutId);
    console.log('Promise was aborted');
  });
});

promise.then(value => {
  console.log(value); // 'success'
}).catch(error => {
  if (error.name === 'AbortError') {
    console.log('Promise was aborted');
  } else {
    console.log('Promise was rejected:', error);
  }
});

// 中断Promise
setTimeout(() => {
  promise.abort('User cancelled');
}, 2000);

// 使用AbortController
const promise2 = new Promise((resolve, reject, abort) => {
  const controller = promise2.getAbortController();
  
  controller.signal.addEventListener('abort', () => {
    console.log('Abort signal received');
  });

  setTimeout(() => {
    resolve('success');
  }, 3000);
});

// 通过AbortController中断
setTimeout(() => {
  const controller = promise2.getAbortController();
  controller.abort('Timeout');
}, 1000);

// 链式调用中的abort
new Promise((resolve, reject, abort) => {
  setTimeout(() => resolve(1), 1000);
})
.then(x => {
  console.log('First then:', x);
  return new Promise((resolve, reject, abort) => {
    setTimeout(() => resolve(x + 1), 1000);
  });
})
.then(x => {
  console.log('Second then:', x);
  return x * 2;
})
.then(console.log)
.catch(error => {
  if (error.name === 'AbortError') {
    console.log('Chain was aborted');
  } else {
    console.log('Chain error:', error);
  }
});

// Promise.all with abort
const promises = [
  new Promise((resolve, reject, abort) => {
    setTimeout(() => resolve('A'), 2000);
  }),
  new Promise((resolve, reject, abort) => {
    setTimeout(() => resolve('B'), 3000);
  }),
  new Promise((resolve, reject, abort) => {
    setTimeout(() => resolve('C'), 4000);
  })
];

const allPromise = Promise.all(promises);

setTimeout(() => {
  allPromise.abort('All promises aborted');
}, 1500);

allPromise.then(values => {
  console.log('All completed:', values);
}).catch(error => {
  if (error.name === 'AbortError') {
    console.log('All promises were aborted');
  } else {
    console.log('All promises error:', error);
  }
});