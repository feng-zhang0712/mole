import { useLayoutEffect, useState } from "react";
import { isRtl } from "../utils/isRtl.js";

/**
 * @param {HTMLElement | null} element
 * @param {"ltr" | "rtl"} [dir]
 * @returns {boolean}
 */
export function useIsRtl(element, dir) {
  const [value, setValue] = useState(dir === "rtl");

  useLayoutEffect(() => {
    if (element) {
      if (!dir) {
        setValue(isRtl(element));
      }
    }
  }, [dir, element]);

  return value;
}
