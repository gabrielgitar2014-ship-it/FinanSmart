import { Routes, Route, Navigate } from "react-router-dom";

// 🧠 Contextos e Proteção
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import AppLayout from "./layout/AppLayout.jsx";

// 📄 Páginas principais
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Accounts from "./pages/Accounts.jsx";
import Categories from "./pages/Categories.jsx";
import Settings from "./pages/Settings.jsx";
import Members from "./pages/Members.jsx";

// 🔐 Autenticação
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

// 📬 Convite (apenas o link público de aceitação)
import AcceptInvite from "./pages/AcceptInvite.jsx";

export default function App() {
  return (
    <Routes>
      {/* 🔐 Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* 🔗 Aceitação de convites */}
      <Route path="/invite/:token" element={<AcceptInvite />} />

      {/* 🔒 Área protegida */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard principal */}
        <Route path="/" element={<Dashboard />} />

        {/* Módulos principais */}
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/settings" element={<Settings />} />

        {/* Household (Membros + Convites integrados) */}
        <Route path="/members" element={<Members />} />
      </Route>

      {/* Redirecionamento padrão */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
