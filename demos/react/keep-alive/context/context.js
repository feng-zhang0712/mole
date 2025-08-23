import { createContext, useContext, useReducer } from 'react';

const StateContext = createContext();

const initState = {};

function stateReducer(state, action) {
  switch (action.type) {
    case 'SAVE_STATE':
      return {
        ...state,
        componentState: {
          ...state.componentState,
          [action.component]: action.payload,
        },
      };
    default:
      return state;
  }
}

export const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(stateReducer, initState);
  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};

export const useGlobalState = () => useContext(StateContext);
