import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { MonthProvider } from "./context/MonthContext.jsx";
import { FinanceProvider } from "./context/FinanceContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MonthProvider>
          <FinanceProvider>
            <App />
          </FinanceProvider>
        </MonthProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
