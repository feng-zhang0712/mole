import { getRTLOffsetType } from "./getRTLOffsetType.js";

/**
 * @param {Object} params
 * @param {HTMLElement | null} params.containerElement
 * @param {"horizontal" | "vertical"} params.direction
 * @param {boolean} params.isRtl
 * @param {number} params.scrollOffset
 * @returns {number}
 */
export function adjustScrollOffsetForRtl({
  containerElement,
  direction,
  isRtl,
  scrollOffset
}) {
  // TRICKY According to the spec, scrollLeft should be negative for RTL aligned elements.
  // This is not the case for all browsers though (e.g. Chrome reports values as positive, measured relative to the left).
  // So we need to determine which browser behavior we're dealing with, and mimic it.
  if (direction === "horizontal") {
    if (isRtl) {
      switch (getRTLOffsetType()) {
        case "negative": {
          return -scrollOffset;
        }
        case "positive-descending": {
          if (containerElement) {
            const { clientWidth, scrollLeft, scrollWidth } = containerElement;
            return scrollWidth - clientWidth - scrollLeft;
          }
          break;
        }
      }
    }
  }
  return scrollOffset;
}
