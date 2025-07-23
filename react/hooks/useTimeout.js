// https://grok.com/share/bGVnYWN5_7102d2f5-c2da-40b3-8482-df99cba3ab61

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
 