import { useMemo } from 'react';

export function useMemoizedObject(unstableObject) {
  return useMemo(() => unstableObject, Object.values(unstableObject));
}
