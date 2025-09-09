let size = -1;

/**
 * @param {boolean} [recalculate=false]
 * @returns {number}
 */
export function getScrollbarSize(recalculate = false) {
  if (size === -1 || recalculate) {
    const div = document.createElement("div");
    const style = div.style;
    style.width = "50px";
    style.height = "50px";
    style.overflow = "scroll";

    document.body.appendChild(div);

    size = div.offsetWidth - div.clientWidth;

    document.body.removeChild(div);
  }

  return size;
}

/**
 * @param {number} value
 */
export function setScrollbarSizeForTests(value) {
  size = value;
}
