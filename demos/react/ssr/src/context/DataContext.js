import React, { createContext, useContext, useReducer, useEffect } from 'react';

// 初始状态
const initialState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  isHydrated: false
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_CURRENT_PRODUCT: 'SET_CURRENT_PRODUCT',
  SET_ERROR: 'SET_ERROR',
  SET_HYDRATED: 'SET_HYDRATED'
};

// Reducer
function dataReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_PRODUCTS:
      return { ...state, products: action.payload, loading: false };
    case ACTIONS.SET_CURRENT_PRODUCT:
      return { ...state, currentProduct: action.payload, loading: false };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTIONS.SET_HYDRATED:
      return { ...state, isHydrated: true };
    default:
      return state;
  }
}

// Context
const DataContext = createContext();

// Provider component
export function DataProvider({ children, initialState: serverState }) {
  const [state, dispatch] = useReducer(dataReducer, serverState || initialState);

  // 检查是否已经有服务端数据
  useEffect(() => {
    if (serverState && !state.isHydrated) {
      dispatch({ type: ACTIONS.SET_HYDRATED, payload: true });
    }
  }, [serverState, state.isHydrated]);

  // 获取产品列表
  const fetchProducts = async () => {
    // 如果已经有数据且已水合，不重复获取
    if (state.products.length > 0 && state.isHydrated) {
      return;
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const products = await response.json();
      dispatch({ type: ACTIONS.SET_PRODUCTS, payload: products });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // 获取单个产品
  const fetchProduct = async (id) => {
    // 如果已经有当前产品且已水合，不重复获取
    if (state.currentProduct?.id === id && state.isHydrated) {
      return;
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const product = await response.json();
      dispatch({ type: ACTIONS.SET_CURRENT_PRODUCT, payload: product });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const value = {
    ...state,
    fetchProducts,
    fetchProduct
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// Hook to use the context
export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
