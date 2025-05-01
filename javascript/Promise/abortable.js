// 1. 使用 AbortController

const controller = new AbortController();
  const signal = controller.signal;

  function doSomething() {
    return new Promise((resolve, reject) => {
      const timerId = setTimeout(() => {
        resolve('Task completed.');
      }, 5000);

      signal.addEventListener('abort', () => {
        clearTimeout(timerId);
        reject(new DOMException('Aborted', 'AbortError'));
      }, { once: true });
    });
  }

  const p = doSomething();

  // 想要中断时
  controller.abort();

  // 2. 使用自定义 Promise 包装器

  class AbortablePromise {
    constructor(executor) {
      let _resolve, _reject;
      this.promise = new Promise((resolve, reject) => {
        _resolve = resolve;
        _reject = reject;
        executor(resolve, reject);
      });

      this.isAborted = false;
    }

    abort() {
      if (!this.isAborted) {
        this.isAborted = true;
        this.reject(new Error('Aborted'));
      }
    }

    then(onFulfilled, onRejected) {
      return this.promise.then(onFulfilled, onRejected);
    }

    catch(onRejected) {
      return this.promise.catch(onRejected);
    }
  }

  const abortablePromise = new AbortablePromise(resolve => {
    setTimeout(() => {
      resolve('Task completed.');
    }, 5000);
  });

  // 使用
  abortablePromise.then(result => console.log(result))
  .catch(error => console.error(error));

  // 想要中断时
  abortablePromise.abort();
