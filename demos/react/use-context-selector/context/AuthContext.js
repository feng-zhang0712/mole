import React, { useMemo, useReducer } from 'react';
import { mockLogin, mockChangeUser } from '../data/mock';
import { createContext, useContextSelector } from '../hooks/useContextSelector';

const initialState = {
  user: null,
  loading: false,
  isAuthenticated: false,
};

const AUTH_ACTION = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CHANGE_USER: 'CHANGE_USER',
  SET_LOADING: 'SET_LOADING',
};

function authReducer(state = initialState, action) {
  switch (action.type) {
    case AUTH_ACTION.LOGIN:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
      };
    case AUTH_ACTION.CHANGE_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
      };
    case AUTH_ACTION.LOGOUT:
      return initialState;
    case AUTH_ACTION.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
}

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState); 

  const login = async () => {
    dispatch({
      type: AUTH_ACTION.SET_LOADING,
      payload: true,
    });

    try {
      const { user } = await mockLogin();
      dispatch({
        type: AUTH_ACTION.LOGIN,
        payload: {
          user,
        }
      });
    } catch (error) {
      
    } finally {
      dispatch({
        type: AUTH_ACTION.SET_LOADING,
        payload: false,
      });
    }
  };

  const logout = async () => {
    dispatch({
      type: AUTH_ACTION.SET_LOADING,
      payload: true,
    });

    try {
      dispatch({ type: AUTH_ACTION.LOGOUT });
    } catch (error) {
      
    } finally {
      dispatch({
        type: AUTH_ACTION.SET_LOADING,
        payload: false,
      });
    }
  };

  const changeUser = async () => {
    dispatch({
      type: AUTH_ACTION.SET_LOADING,
      payload: true,
    });

    try {
      const { user } = await mockChangeUser(state.user);
      dispatch({
        type: AUTH_ACTION.CHANGE_USER,
        payload: {
          user,
        }
      });
    } catch (error) {
      
    } finally {
      dispatch({
        type: AUTH_ACTION.SET_LOADING,
        payload: false,
      });
    }
  }

  const memoizedValue = useMemo(() => ({
    ...state, login, logout, changeUser,
  }), [])

  return (
    <AuthContext.Provider
      value={{
        ...state, login, logout, changeUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

const useAuthSelector = selector => useContextSelector(AuthContext, selector);

export default AuthProvider;
export {
  useAuthSelector,
};
