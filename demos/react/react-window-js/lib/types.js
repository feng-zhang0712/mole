// Type definitions for JavaScript version
// These are JSDoc comments for better IDE support

/**
 * @typedef {"auto" | "center" | "end" | "smart" | "start"} Align
 */

/**
 * @typedef {keyof JSX.IntrinsicElements} TagNames
 */

/**
 * @typedef {Object} Bounds
 * @property {number} size
 * @property {number} scrollOffset
 */

/**
 * @typedef {"horizontal" | "vertical"} Direction
 */

/**
 * @typedef {function(number, Object): number} SizeFunction
 */

export const Align = {
  AUTO: "auto",
  CENTER: "center", 
  END: "end",
  SMART: "smart",
  START: "start"
};

export const Direction = {
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical"
};
