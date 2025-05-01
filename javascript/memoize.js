/**
 * Memoize function
*/

function memoize(fn) {
  if (typeof fn !== 'function') {
    throw new Error('Argument must be a function');
  }

  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.get(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  }
}