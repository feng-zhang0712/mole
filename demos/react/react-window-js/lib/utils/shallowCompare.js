import { assert } from "./assert.js";

export function shallowCompare(a, b) {
  if (a === b) {
    return true;
  }

  if (!!a !== !!b) {
    return false;
  }

  assert(a !== undefined);
  assert(b !== undefined);

  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  for (const key in a) {
    if (!Object.is(b[key], a[key])) {
      return false;
    }
  }

  return true;
}
