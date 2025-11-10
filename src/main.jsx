import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { FinanceProvider } from "./context/FinanceContext.jsx";
import { MonthProvider } from "./context/MonthContext.jsx";

/**
 * 🌐 Ponto de entrada principal do FinanSmart
 * 
 * - Envolve toda a aplicação nos providers globais
 * - Configura o MonthProvider para controle de mês ativo em toda a aplicação
 * - Configura o FinanceProvider para conexão e sincronização com Supabase
 * - Define roteamento principal com React Router
 */

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <MonthProvider>
        <FinanceProvider>
          <App />
        </FinanceProvider>
      </MonthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
