import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// 导入国际化配置
import '@i18n';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
