import { assert } from "../utils/assert.js";

/**
 * @template {Object} Props
 * @param {Object} params
 * @param {import('../types.js').CachedBounds} params.cachedBounds
 * @param {number} params.itemCount
 * @param {number | ((index: number, props: Props) => number)} params.itemSize
 * @returns {number}
 */
export function getEstimatedSize({ cachedBounds, itemCount, itemSize }) {
  if (itemCount === 0) {
    return 0;
  } else if (typeof itemSize === "number") {
    return itemCount * itemSize;
  } else {
    const bounds = cachedBounds.get(
      cachedBounds.size === 0 ? 0 : cachedBounds.size - 1
    );
    assert(bounds !== undefined, "Unexpected bounds cache miss");

    const averageItemSize =
      (bounds.scrollOffset + bounds.size) / cachedBounds.size;

    return itemCount * averageItemSize;
  }
}
