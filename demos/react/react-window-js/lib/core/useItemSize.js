import { assert } from "../utils/assert.js";

export function useItemSize({ containerSize, itemSize: itemSizeProp }) {
  let itemSize;
  switch (typeof itemSizeProp) {
    case "string": {
      assert(
        itemSizeProp.endsWith("%"),
        `Invalid item size: "${itemSizeProp}"; string values must be percentages (e.g. "100%")`
      );
      assert(
        containerSize !== undefined,
        "Container size must be defined if a percentage item size is specified"
      );

      itemSize = (containerSize * parseInt(itemSizeProp)) / 100;
      break;
    }
    default: {
      itemSize = itemSizeProp;
      break;
    }
  }

  return itemSize;
}
