import React from 'react';
import { StateProvider } from './context';
import KeepAliveComponent from './KeepAliveComponent';

function App() {
  return (
    <StateProvider>
      <KeepAliveComponent />
    </StateProvider>
  );
}

export default App;
