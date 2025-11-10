import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// 🧠 Contextos globais
import { AuthProvider } from "./context/AuthContext.jsx";
import { MonthProvider } from "./context/MonthContext.jsx";
import { FinanceProvider } from "./context/FinanceContext.jsx";
import { TransactionModalProvider } from "./context/TransactionModalContext.jsx";

// 🌐 App principal
import App from "./App.jsx";

// 🎨 Estilos globais
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MonthProvider>
          <FinanceProvider>
            <TransactionModalProvider>
              <App />
            </TransactionModalProvider>
          </FinanceProvider>
        </MonthProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
