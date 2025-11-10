import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de Proteção de Rota.
 * Verifica se o usuário está logado (tem uma sessão).
 * Se não estiver, redireciona para a página de login.
 * Se estiver, renderiza os componentes filhos (a rota protegida).
 */
export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  // NOTA: A lógica de 'loading' principal está no AuthProvider,
  // então quando chegamos aqui, 'loading' já deve ser 'false'.
  // Mas é uma boa prática manter a verificação.
  if (loading) {
     return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando sessão...</p>
      </div>
    );
  }

  // Se não houver sessão, redirecione para o login
  if (!session) {
    // O 'replace' evita que o usuário volte para a rota protegida
    // usando o botão "voltar" do navegador.
    return <Navigate to="/login" replace />;
  }

  // Se houver sessão, renderize o conteúdo protegido
  return children;
}