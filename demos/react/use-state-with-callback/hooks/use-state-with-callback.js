import { useCallback, useEffect, useRef, useState } from 'react';

function useStateWithCallback(initialState) {
  const [state, setState] = useState(initialState);
  const callbackRef = useRef();

  const setStateWithCallback = useCallback(
    (nextState, callback) => {
      if (callback && typeof callback !== 'function') {
        throw new Error('useStateWithCallback: callback must be a function.');
      }

      callbackRef.current = callback;

      setState(nextState);
  }, []);

  useEffect(() => {
    if (callbackRef.current) {
      try {
        callbackRef.current(state);
      } catch (error) {
        console.log(error);
      } finally {
        callbackRef.current = null;
      }
    }
  }, [state]);

  useEffect(() => {
    return () => {
      callbackRef.current = null;
    };
  }, []);
  
  return [state, setStateWithCallback];
}

export default useStateWithCallback;
