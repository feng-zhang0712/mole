/**
 * @param {HTMLElement} element
 * @returns {boolean}
 */
export function isRtl(element) {
  let currentElement = element;
  while (currentElement) {
    if (currentElement.dir) {
      return currentElement.dir === "rtl";
    }

    currentElement = currentElement.parentElement;
  }

  return false;
}
