import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { Auth } from '@supabase/auth-ui-react'; 
import { ThemeSupa } from '@supabase/auth-ui-shared'; 

export default function AcceptInvite() {
  const { token } = useParams();
  const { user } = useAuth(); // Status de autenticação
  const navigate = useNavigate();
  
  const [status, setStatus] = useState("loading");
  const [inviteDetails, setInviteDetails] = useState(null); 

  /* ========================================
     ➡️ FUNÇÃO PRINCIPAL: Processar Convite
     ======================================== */
  useEffect(() => {
    if (!token) {
        setStatus("invalid");
        return;
    }

    const processInvite = async () => {
      
      // 1. VALIDAÇÃO DO CONVITE (GET /invite/:token)
      // Verifica se o token é válido, expirado, ou já usado.
      const { data, error: funcError } = await supabase.functions.invoke(`invite/${token}`, {
          method: 'GET',
      });
      
      if (funcError || !data.success || !data.valid) {
          setStatus("invalid"); 
          return;
      }
      
      setInviteDetails(data.invite); 

      // 2. SE NÃO ESTIVER LOGADO, PARE AQUI. A renderização cuidará do Auth UI.
      if (!user) {
        setStatus("login_required");
        return;
      }
      
      // 3. CONTINUAÇÃO (Executado SOMENTE se o usuário estiver logado)
      
      // 3a. VERIFICAÇÃO DE E-MAIL
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .single();
        
      if (profile.email.toLowerCase() !== data.invite.email.toLowerCase()) {
        setStatus("email_mismatch");
        return;
      }
      
      // 3b. ACEITAÇÃO DO CONVITE (POST /invite/:token)
      const { error: acceptError } = await supabase.functions.invoke(`invite/${token}`, {
          method: 'POST',
          body: { 
            token: token, 
            user_id: user.id 
          },
      });

      if (acceptError) {
          setStatus("used"); 
          return;
      }

      setStatus("success");
      setTimeout(() => navigate("/dashboard" || "/"), 2000); 
    };
    
    // A função só executa se não estivermos no estado de 'login_required'
    if (status !== 'login_required') {
        processInvite();
    }
  }, [user, token, navigate, status]); // Adicionamos 'status' como dependência

  /* ========================================
     ➡️ MENSAGENS E RENDERIZAÇÃO
     ======================================== */
  const messages = {
    loading: "Verificando convite...",
    success: "Convite aceito com sucesso! 🎉 Redirecionando...",
    expired: "Este convite expirou.",
    invalid: "Convite inválido ou inexistente.",
    used: "Convite já utilizado.", 
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
                  view={'sign_in'} 
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