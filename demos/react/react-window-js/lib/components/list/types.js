// Type definitions for List component

/**
 * @typedef {Object} ListImperativeAPI
 * @property {function(): HTMLDivElement | null} element
 * @property {function({ align?: "auto" | "center" | "end" | "smart" | "start"; behavior?: "auto" | "instant" | "smooth"; index: number }): void} scrollToRow
 */

/**
 * @typedef {Object} OnRowsRendered
 * @property {number} startIndex
 * @property {number} stopIndex
 */

/**
 * @typedef {Map<number, { height: number; scrollTop: number }>} CachedBounds
 */

export const ListImperativeAPI = {};
export const OnRowsRendered = {};
export const CachedBounds = {};
