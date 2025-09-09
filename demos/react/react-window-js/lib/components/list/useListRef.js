import { useRef } from "react";

/**
 * Convenience hook to return a properly typed ref for the List component.
 * @returns {import('react').RefObject<import('./types.js').ListImperativeAPI>}
 */
export const useListRef = () => useRef(null);
