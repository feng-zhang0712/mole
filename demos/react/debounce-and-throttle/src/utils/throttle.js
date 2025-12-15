import {
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';

export function throttle(func, ms) {
  let timer;
  return function () {
    if (!timer) {
      const _this = this;
      timer = setTimeout(() => {
        func.apply(_this, [].slice.call(arguments));
        timer = null;
      }, ms);
    }
  }
}

export function useThrottle(value, ms = 0) {
  const timerRef = useRef();
  const [state, setState ] = useState(value);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        setState(value);
        timerRef.current = null;
      }, ms);
    }
    return () => clearTimer();
  }, [value, ms]);

  return [state, clearTimer];
}

export function useThrottleFn(fn, ms = 0) {
  const timerRef = useRef();
  const [state, setState] = useState();

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const execute = useCallback((...args) => {
    if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        setState(fn(...args));
        timerRef.current = null;
      }, ms);
    }
  }, [fn, ms]);

  useEffect(() => {
    return () => clearTimer();
  }, deps);

  return [state, execute, clearTimer];
}