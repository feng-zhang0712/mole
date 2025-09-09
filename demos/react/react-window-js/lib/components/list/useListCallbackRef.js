import { useState } from "react";

/**
 * Convenience hook to return a properly typed ref callback for the List component.
 *
 * Use this hook when you need to share the ref with another component or hook.
 * @returns {[import('./types.js').ListImperativeAPI | null, function(import('./types.js').ListImperativeAPI | null): void]}
 */
export const useListCallbackRef = () => useState(null);
