**状态模式**：组件状态机、生命周期管理

### 3.4 状态模式（State Pattern）

**定义**：允许对象在内部状态改变时改变它的行为。

**React中的应用**：

#### 3.4.1 组件状态机

```jsx
import React, { useState, useReducer } from 'react';

// 状态枚举
const STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// 状态转换规则
const stateTransitions = {
  [STATES.IDLE]: {
    FETCH: STATES.LOADING
  },
  [STATES.LOADING]: {
    SUCCESS: STATES.SUCCESS,
    ERROR: STATES.ERROR
  },
  [STATES.SUCCESS]: {
    RESET: STATES.IDLE
  },
  [STATES.ERROR]: {
    RETRY: STATES.LOADING,
    RESET: STATES.IDLE
  }
};

// 状态机Reducer
const stateMachineReducer = (state, action) => {
  const nextState = stateTransitions[state.status]?.[action.type];
  if (nextState) {
    return { ...state, status: nextState, data: action.data, error: action.error };
  }
  return state;
};

// 使用状态模式
const DataFetcher = () => {
  const [state, dispatch] = useReducer(stateMachineReducer, {
    status: STATES.IDLE,
    data: null,
    error: null
  });

  const fetchData = async () => {
    dispatch({ type: 'FETCH' });
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      dispatch({ type: 'SUCCESS', data });
    } catch (error) {
      dispatch({ type: 'ERROR', error: error.message });
    }
  };

  const reset = () => {
    dispatch({ type: 'RESET' });
  };

  const retry = () => {
    dispatch({ type: 'RETRY' });
    fetchData();
  };

  return (
    <div>
      {state.status === STATES.IDLE && (
        <button onClick={fetchData}>Fetch Data</button>
      )}
      {state.status === STATES.LOADING && (
        <div>Loading...</div>
      )}
      {state.status === STATES.SUCCESS && (
        <div>
          <h3>Data loaded successfully!</h3>
          <pre>{JSON.stringify(state.data, null, 2)}</pre>
          <button onClick={reset}>Reset</button>
        </div>
      )}
      {state.status === STATES.ERROR && (
        <div>
          <h3>Error: {state.error}</h3>
          <button onClick={retry}>Retry</button>
          <button onClick={reset}>Reset</button>
        </div>
      )}
    </div>
  );
};
```
