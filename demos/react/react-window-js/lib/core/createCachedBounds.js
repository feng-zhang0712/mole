import { assert } from "../utils/assert.js";

/**
 * @template {Object} Props
 * @param {Object} params
 * @param {number} params.itemCount
 * @param {Props} params.itemProps
 * @param {number | string | ((index: number, props: Props) => number)} params.itemSize
 * @returns {import('../types.js').CachedBounds}
 */
export function createCachedBounds({ itemCount, itemProps, itemSize }) {
  const cache = new Map();

  return {
    get(index) {
      assert(index < itemCount, `Invalid index ${index}`);

      while (cache.size - 1 < index) {
        const currentIndex = cache.size;

        let size;
        switch (typeof itemSize) {
          case "function": {
            size = itemSize(currentIndex, itemProps);
            break;
          }
          case "number": {
            size = itemSize;
            break;
          }
        }

        if (currentIndex === 0) {
          cache.set(currentIndex, {
            size,
            scrollOffset: 0
          });
        } else {
          const previousRowBounds = cache.get(currentIndex - 1);
          assert(
            previousRowBounds !== undefined,
            `Unexpected bounds cache miss for index ${index}`
          );

          cache.set(currentIndex, {
            scrollOffset:
              previousRowBounds.scrollOffset + previousRowBounds.size,
            size
          });
        }
      }

      const bounds = cache.get(index);
      assert(
        bounds !== undefined,
        `Unexpected bounds cache miss for index ${index}`
      );

      return bounds;
    },
    set(index, bounds) {
      cache.set(index, bounds);
    },
    get size() {
      return cache.size;
    }
  };
}
