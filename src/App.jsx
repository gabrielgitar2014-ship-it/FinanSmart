import { Routes, Route } from 'react-router-dom';

// Páginas Públicas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';

// Páginas Protegidas
import DashboardPage from './pages/DashboardPage';
import NewTransactionPage from './pages/NewTransactionPage';
import AddAccountPage from './pages/AddAccountPage'; // A página de Adicionar Conta
import AccountsPage from './pages/AccountsPage'; // A página de Listar Contas

// Componentes de Rota
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout'; // O Layout que contém a Sidebar

function App() {
  return (
    <Routes>
      {/* === Rotas Públicas (sem sidebar) === */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/update-password" element={<UpdatePasswordPage />} />
      <Route path="/" element={<LoginPage />} /> {/* Rota raiz vai para login */}

      {/* === Rotas Protegidas (com sidebar) === */}
      <Route 
        element={
          <ProtectedRoute>
            <Layout /> {/* Usa o Layout para agrupar todas as rotas protegidas */}
          </ProtectedRoute>
        }
      >
        {/* Rotas filhas que serão renderizadas dentro do <Outlet> do Layout */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/new-transaction" element={<NewTransactionPage />} />
        <Route path="/add-account" element={<AddAccountPage />} />
        
        {/* Rota principal de Contas */}
        <Route path="/accounts" element={<AccountsPage />} />
        
        {/* Placeholders para as rotas da Sidebar que ainda não fizemos */}
        <Route path="/transactions" element={<div className="p-8"><h1 className="text-2xl font-bold">Transações</h1></div>} />
        <Route path="/categories" element={<div className="p-8"><h1 className="text-2xl font-bold">Categorias</h1></div>} />
        <Route path="/settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Configurações</h1></div>} />
      </Route>
    </Routes>
  );
}

export default App;