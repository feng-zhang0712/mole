import { useMemo } from "react";

export function useMemoizedObject(unstableObject) {
  return useMemo(() => {
    return unstableObject;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, Object.values(unstableObject));
}
