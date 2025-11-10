import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// 1. Criar o Contexto
const AuthContext = createContext(null);

// 2. Criar o Provedor (Provider)
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tenta pegar a sessão inicial (ex: se o usuário deu F5)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Ouve mudanças no estado de autenticação (Login, Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        // Se a sessão mudou, não estamos mais carregando (caso seja a primeira vez)
        if (loading) setLoading(false);
      }
    );

    // Limpa o "ouvinte" quando o componente é desmontado
    return () => subscription.unsubscribe();
  }, [loading]); // Adicionado loading para garantir a lógica de carregamento

  const value = {
    session,
    user: session?.user || null,
    loading,
  };

  // Se estiver carregando a sessão inicial, não renderize o app ainda
  // Isso evita o "flicker" (piscar) da tela de login
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* Aqui você pode colocar um spinner ou logo */}
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Criar o Hook customizado (para facilitar o uso)
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}