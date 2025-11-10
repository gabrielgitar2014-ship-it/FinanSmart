import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function AcceptInvite() {
  const { token } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const acceptInvite = async () => {
      if (!user) {
        setStatus("login_required");
        return;
      }

      const { data: invite, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("token", token)
        .single();

      if (error || !invite) {
        setStatus("invalid");
        return;
      }

      if (invite.status !== "pending") {
        setStatus("used");
        return;
      }

      const now = new Date();
      if (new Date(invite.expires_at) < now) {
        await supabase
          .from("invitations")
          .update({ status: "expired" })
          .eq("id", invite.id);
        setStatus("expired");
        return;
      }

      // Verifica se e-mail bate
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("id", user.id)
        .single();

      if (profile.email.toLowerCase() !== invite.email.toLowerCase()) {
        setStatus("email_mismatch");
        return;
      }

      // Adiciona o usuário à household
      await supabase.from("household_members").insert({
        household_id: invite.household_id,
        user_id: user.id,
        role: "member",
      });

      // Atualiza o convite como aceito
      await supabase
        .from("invitations")
        .update({ status: "accepted" })
        .eq("id", invite.id);

      setStatus("success");
      setTimeout(() => navigate("/"), 2000);
    };

    acceptInvite();
  }, [user, token, navigate]);

  const messages = {
    loading: "Verificando convite...",
    success: "Convite aceito com sucesso! 🎉 Redirecionando...",
    expired: "Este convite expirou.",
    invalid: "Convite inválido.",
    used: "Este convite já foi utilizado.",
    login_required: "Faça login para aceitar o convite.",
    email_mismatch: "Este convite foi enviado para outro e-mail.",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 w-full max-w-sm text-center">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Convite FinanSmart</h2>
        <p className="text-sm text-gray-600">{messages[status]}</p>
      </div>
    </div>
  );
}
