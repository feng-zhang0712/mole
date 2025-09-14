import { useMemo } from "react";
import { createCachedBounds } from "./createCachedBounds.js";

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
