import React, { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import { i18n } from '@i18n';
import Home from './pages/Home';
import './App.css';

const App = () => (
  <I18nextProvider i18n={i18n}>
    <div className="app">
      <Suspense fallback={
        <div className="app__loading">
          <div className="spinner" />
          <p>Loading...</p>
        </div>
      }
      >
        <Home />
      </Suspense>
    </div>
  </I18nextProvider>
);

export default App;
