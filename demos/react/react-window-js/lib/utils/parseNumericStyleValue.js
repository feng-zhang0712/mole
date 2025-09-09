/**
 * @param {import('react').CSSProperties['height']} value
 * @returns {number | undefined}
 */
export function parseNumericStyleValue(value) {
  if (value !== undefined) {
    switch (typeof value) {
      case "number": {
        return value;
      }
      case "string": {
        if (value.endsWith("px")) {
          return parseFloat(value);
        }
        break;
      }
    }
  }
}
