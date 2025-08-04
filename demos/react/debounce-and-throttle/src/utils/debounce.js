import { useCallback, useEffect, useRef, useState } from 'react';

export function debounce(func, ms) {
  let timer;
  return function () {
    if (timer) {
      clearTimeout(timer);
    }
    const _this = this;
    timer = setTimeout(function () {
      func.apply(_this, [].slice.call(arguments));
      timer = null;
    }, ms);
  }
}

export function useDebounce(value, ms = 0) {
  const timerRef = useRef(value);
  const [state, setState] = useState();

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setState(value);
      timerRef.current = null;
    }, ms);
    return () => clearTimer();
  }, [value, ms]);

  return [state, clearTimer];
}

export function useDebounceFn(fn, ms = 0, deps = []) {
  const timerRef = useRef();
  const [state, setState] = useState();

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const execute = useCallback((...args) => {
    clearTimer();
    timerRef = setTimeout(() => {
      setState(fn(...args));
      timerRef.current = null;
    }, ms);
  }, [fn, ms]);

  useEffect(() => {
    return () => clearTimer();
  }, deps);

  return [state, execute, clearTimer];
}
