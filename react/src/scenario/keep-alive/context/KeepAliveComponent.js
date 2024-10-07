import React, { useEffect, useState } from 'react';
import { useGlobalState } from './context';

function KeepAliveComponent() {
  const { state, dispatch } = useGlobalState();
  const [localState, setLocalState] = useState(state.componentState.KeepAliveComponent || {});

  useEffect(() => {
    return () => {
      dispatch({
        type: 'SAVE_STATE',
        component: 'KeepAliveComponent',
        payload: localState,
      });
    };
  }, []);

  return (
    <input
      type='text'
      value={localState || ''}
      onChange={(e) => setLocalState({ ...localState, inputValue: e.target.value })}
    />
  );
}

export default KeepAliveComponent;
