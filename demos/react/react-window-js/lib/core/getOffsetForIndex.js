import { getEstimatedSize } from "./getEstimatedSize.js";

/**
 * @template {Object} Props
 * @param {Object} params
 * @param {"auto" | "center" | "end" | "smart" | "start"} params.align
 * @param {import('../types.js').CachedBounds} params.cachedBounds
 * @param {number} params.index
 * @param {number} params.itemCount
 * @param {number | ((index: number, props: Props) => number)} params.itemSize
 * @param {number} params.containerScrollOffset
 * @param {number} params.containerSize
 * @returns {number}
 */
export function getOffsetForIndex({
  align,
  cachedBounds,
  index,
  itemCount,
  itemSize,
  containerScrollOffset,
  containerSize
}) {
  const estimatedTotalSize = getEstimatedSize({
    cachedBounds,
    itemCount,
    itemSize
  });

  const bounds = cachedBounds.get(index);
  const maxOffset = Math.max(
    0,
    Math.min(estimatedTotalSize - containerSize, bounds.scrollOffset)
  );
  const minOffset = Math.max(
    0,
    bounds.scrollOffset - containerSize + bounds.size
  );

  if (align === "smart") {
    if (
      containerScrollOffset >= minOffset &&
      containerScrollOffset <= maxOffset
    ) {
      align = "auto";
    } else {
      align = "center";
    }
  }

  switch (align) {
    case "start": {
      return maxOffset;
    }
    case "end": {
      return minOffset;
    }
    case "center": {
      if (bounds.scrollOffset <= containerSize / 2) {
        // Too near the beginning to center-align
        return 0;
      } else if (
        bounds.scrollOffset + bounds.size / 2 >=
        estimatedTotalSize - containerSize / 2
      ) {
        // Too near the end to center-align
        return estimatedTotalSize - containerSize;
      } else {
        return bounds.scrollOffset + bounds.size / 2 - containerSize / 2;
      }
    }
    case "auto":
    default: {
      if (
        containerScrollOffset >= minOffset &&
        containerScrollOffset <= maxOffset
      ) {
        return containerScrollOffset;
      } else if (containerScrollOffset < minOffset) {
        return minOffset;
      } else {
        return maxOffset;
      }
    }
  }
}
