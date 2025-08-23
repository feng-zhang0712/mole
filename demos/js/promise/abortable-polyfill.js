const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
const ABORTED = 'aborted';

function isPromise(x) {
  return x instanceof Promise;
}

function isFunction(fn) {
  return typeof fn === 'function';
}

function isObjectOrFunction(x) {
  return x != null && (typeof x === 'object' || typeof x === 'function');
}

function isThenable(x) {
  return isObjectOrFunction(x) && isFunction(x.then);
}

function nextTick(fn) {
  if (typeof process !== 'undefined' && process.nextTick) {
    process.nextTick(fn);
  } else if (typeof setImmediate !== 'undefined') {
    setImmediate(fn);
  } else {
    setTimeout(fn, 0);
  }
}

function isIterable(x) {
  return x && typeof x[Symbol.iterator] === 'function';
}

function AbortError(message = 'Promise was aborted') {
  this.name = 'AbortError';
  this.message = message;
}
AbortError.prototype = Error.prototype;

if (typeof AggregateError === 'undefined') {
  globalThis.AggregateError = function (errors, message) {
    this.name = 'AggregateError';
    this.errors = errors;
    this.message = message;
  }
  AggregateError.prototype = Error.prototype;
}

function Promise(executor) {
  if (!(this instanceof Promise)) {
    throw new TypeError('Promise must be called with new');
  }

  if (!isFunction(executor)) {
    throw new TypeError('Promise constructor argument must be a function');
  }

  this._state = PENDING;
  this._value = undefined;
  this._reason = undefined;
  this._fulfilledCallbacks = [];
  this._rejectedCallbacks = [];

  this._isAborted = false;
  this._abortController = null;
  this._abortedCallbacks = [];

  const resolve = (value) => {
    if (this._state !== PENDING || this._isAborted) return;

    if (value === this) {
      reject(new TypeError('Chaining cycle detected for promise'));
      return;
    }

    if (isThenable(value)) {
      try {
        const { then } = value;
        if (isFunction(then)) {
          return then.call(value, resolve, reject);
        }
      } catch (error) {
        return reject(error);
      }
    }
    
    this._state = FULFILLED;
    this._value = value;
    this._executeCallbacks();
  }

  const reject = (reason) =>  {
    if (this._state !== PENDING || this._isAborted) return;

    this._state = REJECTED;
    this._reason = reason;
    this._executeCallbacks();
  };

  const abort = (reason) => {
    if (this._state !== PENDING || this._isAborted) return;

    this._isAborted = true;
    this.state = ABORTED;
    this._reason = reason || AbortError();
    this._executeCallbacks();

    if (this._abortController) {
      this._abortController.abort(reason);
    }
  };

  this._abortController = {
    signal: {
      aborted: false,
      reason: undefined,
      addEventListener (type, listener) {
        if (type === 'abort') {
          this._abortedCallbacks.push(listener);
        }
      },
      removeEventListener (type, listener) {
        if (typeof type === 'abort') {
          const index = this._abortedCallbacks.indexOf(listener);
          if (index > -1) {
            this._abortedCallbacks.slice(index, 1);
          } 
        }
      }
    },
    abort (reason) {
      if (this._abortController.signal.abort) {
        return;
      }
      this._abortController.signal.abort = true;
      this._abortController.signal.reason = reason || new AbortError();
      this._abortedCallbacks.forEach(cb => {
        try {
          cb();
        } catch (error) {
          // 忽略 abort 回调中的错误
        }
      });
    }
  };

  try {
    executor(resolve, reject, abort);
  } catch (error) {
    reject(error);
  }
}

Promise.prototype._executeCallbacks = function () {
  if (this._state === FULFILLED) {
    for (let index = 0; index < this._fulfilledCallbacks.length; index++) {
      const cb = this._fulfilledCallbacks[index];
      nextTick(() => cb(this._value));
    }
    this._fulfilledCallbacks = [];
  } else if (this._state === REJECTED) {
    for (let index = 0; index < this._rejectedCallbacks.length; index++) {
      const cb = this._rejectedCallbacks[index];
      nextTick(() => cb(this._reason));
    }
    this._rejectedCallbacks = [];
  } else if (this._state === ABORTED) {
    for (let index = 0; index < this._abortedCallbacks.length; index++) {
      const cb = this._abortedCallbacks[index];
      nextTick(() => cb(this._reason));
    }
    this._abortedCallbacks = [];
  }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  if (!isFunction(onFulfilled)) {
    onFulfilled = value => value;
  }

  if (!isFunction(onRejected)) {
    onRejected = reason => {
      throw reason
    };
  }
  
  return new Promise((resolve, reject) => {
    const execute = (cb, value) => {
      try {
        const rst = cb(value);
        if (isPromise(rst)) {
          rst.then(resolve, reject);
        } else {
          resolve(value);
        }
      } catch (error) {
        reject(error);
      }
    }
  
    const handleFulfilled = () => {
      if (this._state === ABORTED) {
        reject(this._reason);
        return;
      }

      execute(onFulfilled, this._value);
    };

    const handleRejected = () =>  execute(onRejected, this._reason);

    if (this._state === PENDING) {
      this._fulfilledCallbacks.push(handleFulfilled);
      this._rejectedCallbacks.push(handleRejected);
    } else if (this._state === FULFILLED) {
      nextTick(handleFulfilled);
    } else if (this._state === REJECTED || this._state === ABORTED) {
      nextTick(handleRejected);
    }
  });
}

Promise.prototype.catch = function (onRejected) {
  return this.then(undefined, onRejected);
}

Promise.prototype.finally = function (cb) {
  if (!isFunction(cb)) return this;

  const P = this.constructor();
  return this.then(
    res => P.resolve(cb()).then(() => res),
    reason => P.then(cb()).then(() => {
      throw reason;
    })
  );
}

Promise.prototype.abort = function (reason) {
  if (this._state === PENDING && !this._isAborted) {
    this._isAborted = true;
    this._state = ABORTED;
    this._reason = reason || new AbortError();
    this._executeCallbacks();

    if (this._abortController) {
      this._abortController.abort(reason);
    }
  }

  return this;
}

Promise.prototype.getAbortController = function () {
  return this._abortController;
}

Promise.prototype.isAborted = function () {
  return this._state === ABORTED || this._isAborted;
}

Promise.resolve = function (value) {
  if (isPromise(value)) {
    return value
  };

  return new Promise(resolve => resolve(value));
}

Promise.reject = function (reason) {
  return new Promise((_, rejected) => rejected(reason));
}

Promise.all = function (iterable) {
  if (!isIterable(iterable)) {
    throw new TypeError('Promise.all requires an iterable');
  }

  const promises = [].slice.call(iterable);
  const count = promises.length;
  if (0 === count) return Promise.resolve([]);

  const rst = new Array(count);
  return new Promise((resolve, reject, abort) => {
    let isAborted = false;

    for (let index = 0; index < count; index++) {
      Promise.resolve(promises[index]).then((res) => {
        if (!isAborted) {
          rst[index] = res;
          if (count === rst.length) {
            resolve(rst);
          }
        }
      },
      reason => {
        if (!isAborted) {
          reject(reason);
        }
      }
    )}

    if (abort) {
      abort(() => {
        isAborted = true;
        for (let index = 0; index < promises.length; index++) {
          const promise = promises[index];
          if (promise && typeof promise.abort === 'function') {
            promise.abort();
          }
        }
      });
    }
  });
}

Promise.any = function (iterable) {
  if (!isIterable(iterable)) {
    throw new TypeError('Promise.all requires an iterable');
  }

  const promises = [].slice.call(iterable);
  const count = promises.length;
  if (0 === count) {
    return Promise.resolve(
      new AggregateError([], 'All promises were rejected'),
    );
  }

  const errors = new Array(count);
  return new Promise((resolve, reject, abort) => {
    let isAborted = false;
    for (let index = 0; index < count; index++) {
      Promise.resolve(promises[index]).then(
        value => {
          if (!isAborted) {
            resolve(value);
          }
        },
       reason => {
          if (!isAborted) {
            errors[index] = reason;
            if (count === errors.length) {
              reject(new AggregateError(errors, 'All promises were rejected'));
            }
          }
        }
      );
    }

    if (abort) {
      abort(() => {
        isAborted = true;
      });
    }
  });
}

Promise.race = function (iterable) {
  if (!isIterable(iterable)) {
    throw new TypeError('Promise.all requires an iterable');
  }

  const promises = [].slice.call(iterable);
  const count = promises.length;
  if (0 === count) return new Promise(() => { });

  return new Promise((resolve, reject, abort) => {
    let isAborted = false;
    for (let index = 0; index < count; index++) {
      Promise.resolve(promises[index]).then(
        value => {
          if (!isAborted) {
            resolve(value);
          }
        },
        reason => {
          if (!isAborted) {
            reject(reason);
          }
        },
      );
    }

    if (abort) {
      abort(() => {
        isAborted = true;
      });
    }
  });
}

Promise.allSettled = function (iterable) {
  if (!isIterable(iterable)) {
    throw new TypeError('Promise.all requires an iterable');
  }

  const promises = [].slice.call(iterable);
  const count = promises.length;
  if (0 === count) return Promise.resolve([]);

  const rst = new Array(count);
  return new Promise((resolve, _, abort) => {
    let isAborted = false;
    for (let index = 0; index < count; index++) {
      Promise.resolve(promises[index])
      .then(value => {
        if (!isAborted) {
          rst[index] = { status: 'fulfilled', value };
          if (count === rst.length) {
            resolve(rst);
          }
        }
      }, reason => {
        if (!isAborted) {
          rst[index] = { status: 'rejected', reason };
          if (count === rst.length) {
            resolve(rst);
          }
        }
      });
    }

    if (abort) {
      abort(() => {
        isAborted = true;
      });
    }
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Promise;
} else if (typeof window !== 'undefined') {
  window.Promise = Promise;
}
