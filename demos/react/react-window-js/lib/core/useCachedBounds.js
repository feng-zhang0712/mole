import { useMemo } from "react";
import { createCachedBounds } from "./createCachedBounds.js";

/**
 * @template {Object} Props
 * @param {Object} params
 * @param {number} params.itemCount
 * @param {Props} params.itemProps
 * @param {number | string | ((index: number, props: Props) => number)} params.itemSize
 * @returns {import('../types.js').CachedBounds}
 */
export function useCachedBounds({ itemCount, itemProps, itemSize }) {
  return useMemo(
    () =>
      createCachedBounds({
        itemCount,
        itemProps,
        itemSize
      }),
    [itemCount, itemProps, itemSize]
  );
}
