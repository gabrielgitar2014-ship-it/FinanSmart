import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext'; // <-- 1. Importe

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* <-- AuthProvider por fora */}
        <FinanceProvider> {/* <-- 2. Coloque por dentro */}
          <App />
        </FinanceProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);