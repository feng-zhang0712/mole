import { useLayoutEffect, useState } from "react";
import { isRtl } from "../utils/isRtl.js";

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
