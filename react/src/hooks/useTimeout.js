import { useEffect, useRef } from 'react';

function useTimeout(fn, delay) {
  const ref = useRef();

  useEffect(() => {
    ref.current = fn;
  }, [fn]);

  useEffect(() => {
    const timeId = setTimeout(ref.current, delay);

    return () => {
      clearTimeout(timeId);
    }
  }, [delay]);
}

export default useTimeout;
 