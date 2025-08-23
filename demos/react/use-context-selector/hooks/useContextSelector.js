import React, {
  createContext as reactCreateContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore
} from 'react';
import deepEqual from '../utils/deepEqual';

function createContextProvider(ReactProvider) {
  return ({ value, children }) => {
    const valueRef = useRef();
    if (!valueRef.current) {
      valueRef.current = {
        value,
        subscribers: new Set(),
      };
    }

    useEffect(() => {
      if (!Object.is(valueRef.current, value)) {
        valueRef.current.value = value;
        valueRef.current.subscribers.forEach(subscriber => 
          subscriber()
        );
      }
    }, [value]);

    return (
      <ReactProvider value={valueRef.current}>{children}</ReactProvider>
    );
  }
}

function createContext(defaultValue) {
  const Context = reactCreateContext({
    value: defaultValue,
    subscribers: new Set(),
  });

  Context.Provider = createContextProvider(Context.Provider);
  delete Context.Consumer;

  return Context;
}

function useContextSelector(context, selector, areEqualProps = deepEqual) {
  const contextValue = useContext(context);
  const { value, subscribers } = contextValue;

  const prevSnapshotRef = useRef(selector(value));

  const subscribe = useCallback(callback => {
    subscribers.add(callback);

    return () => subscribers.delete(callback);
  }, [subscribers]);

  const getSnapshot = () => {
    const nextSnapshot = selector(contextValue.value);
    
    if (areEqualProps(prevSnapshotRef.current, nextSnapshot)) {
      return prevSnapshotRef.current;
    }

    prevSnapshotRef.current = nextSnapshot;
    
    return nextSnapshot;
  };

  return useSyncExternalStore(subscribe, getSnapshot);
}

export {
  createContext,
  useContextSelector,
};