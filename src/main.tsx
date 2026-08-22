import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSecurityShield } from './utils/autoTranslator';

// 🛡️ Initialize Anti-Theft & Content Protection Shield
initSecurityShield();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
