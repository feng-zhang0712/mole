import { assert } from './assert.js';

export function shallowCompare(a, b) {
  if (a === b) {
    return true;
  }

  if (!!a !== !!b) {
    return false;
  }

  assert(a !== undefined);
  assert(b !== undefined);

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  return keysA.every((key) => Object.is(b[key], a[key]));
}
