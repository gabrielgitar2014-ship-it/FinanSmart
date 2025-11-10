import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { Auth } from '@supabase/auth-ui-react'; 
import { ThemeSupa } from '@supabase/auth-ui-shared'; 

// Importante: O CSS do Auth UI deve estar no index.html ou no main.jsx
// para evitar o erro de importação.

export default function AcceptInvite() {
  const { token } = useParams();
  const { user } = useAuth(); // Monitora o estado de login
  const navigate = useNavigate();
  
  // O estado padrão é "loading"
  const [status, setStatus] = useState("loading");
  const [inviteDetails, setInviteDetails] = useState(null); 
  const [errorDetails, setErrorDetails] = useState(null); // Para exibir mensagens de erro detalhadas

  /* ========================================
     ➡️ FUNÇÃO PRINCIPAL: Processar Convite
     (Só executa quando user muda ou na montagem inicial)
     ======================================== */
  useEffect(() => {
    // 1. Condição de Saída Rápida: Sem token ou usuário
    if (!token) {
        setStatus("invalid");
        return;
    }
    
    // Se não houver usuário, interrompe e força a renderização do Auth UI.
    if (!user) {
        setStatus("login_required");
        return;
    }

    // Se o usuário está logado, inicia o processo de aceitação:
    const acceptInviteProcess = async () => {
      
      // 2. VALIDAÇÃO DO CONVITE (GET /invite/:token)
      // Usando a API Fetch nativa, que é mais robusta que o invoke() para GET com token na URL.
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || ''; 
      const endpoint = `${supabase.supabaseUrl}/functions/v1/invite/${token}`;

      const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${accessToken}`, 
              'Content-Type': 'application/json',
          },
      });

      const data = await response.json();
      const funcError = !response.ok; 

      if (funcError || !data.success || !data.invite) {
          setErrorDetails(data?.message || "Erro desconhecido na validação.");
          setStatus("invalid"); 
          return;
      }
      
      const invite = data.invite;
      setInviteDetails(invite); 

      // 3. VERIFICAÇÃO DE E-MAIL (Se for logado com Google/Magic Link)
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .single();
        
      if (profile.email.toLowerCase() !== invite.email.toLowerCase()) {
        setStatus("email_mismatch");
        return;
      }
      
      // 4. ACEITAÇÃO FINAL (POST /invite/:token)
      const { error: acceptError } = await supabase.functions.invoke(`invite/${token}`, {
          method: 'POST',
          body: { 
            token: token, 
            user_id: user.id 
          },
      });

      if (acceptError) {
          setErrorDetails("O convite já foi aceito ou você já é membro.");
          setStatus("used"); 
          return;
      }

      setStatus("success");
      setTimeout(() => navigate("/dashboard" || "/"), 2000); 
    };

    acceptInviteProcess();
  }, [user, token, navigate]); 

  /* ========================================
     ➡️ MENSAGENS E RENDERIZAÇÃO
     ======================================== */
  const messages = {
    loading: "Verificando convite...",
    success: "Convite aceito com sucesso! 🎉 Redirecionando...",
    expired: "Este convite expirou.",
    invalid: errorDetails || "Convite inválido ou inexistente.", // Exibe detalhes do erro da Edge Function
    used: errorDetails || "Convite já utilizado ou você já faz parte da família.", 
    login_required: "Faça login ou crie sua conta para aceitar o convite.",
    email_mismatch: `Este convite foi enviado para o e-mail: ${inviteDetails ? inviteDetails.email : 'outro e-mail'}. Por favor, faça login com a conta correta.`,
  };

  const getStatusColor = (status) => {
      switch (status) {
          case 'success': return 'text-green-600';
          case 'invalid':
          case 'used':
          case 'expired':
          case 'email_mismatch': return 'text-red-600';
          default: return 'text-gray-800';
      }
  };


  // --- Renderização do Auth UI quando necessário ---
  if (status === 'login_required' || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-6">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 w-full max-w-sm text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Aceitar Convite FinanSmart</h2>
              <p className="text-sm text-gray-600 mb-6">
                  {messages['login_required']}
              </p>
              
              {/* O FORMULÁRIO DE AUTENTICAÇÃO */}
              <Auth
                  supabaseClient={supabase}
                  appearance={{ theme: ThemeSupa }}
                  
                  // Inicia no modo Cadastro, mas permite alternar para Login.
                  view={'sign_up'} 
                  providers={['google']} 
                  showBackButton={false} 
              />
          </div>
      </div>
    );
  }

  // --- Renderização de Status (Carregando, Sucesso, Erro) ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 w-full max-w-sm text-center">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Convite FinanSmart</h2>
        <p className={`text-sm ${getStatusColor(status)}`}>{messages[status]}</p>
      </div>
    </div>
  );
}
