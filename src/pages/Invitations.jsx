import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";
import { supabase } from "../lib/supabaseClient";
import { Copy } from "lucide-react";

export default function Invitations() {
  const { user } = useAuth();
  const { household } = useFinance();
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);

  const generateInvite = async () => {
    if (!email) return alert("Digite um e-mail válido.");
    setLoading(true);

    const token = crypto.randomUUID();
    const { error } = await supabase.from("invitations").insert({
      household_id: household,
      inviter_id: user.id,
      email,
      token,
    });

    if (error) {
      console.error(error);
      alert("Erro ao gerar convite.");
      setLoading(false);
      return;
    }

    const link = `${window.location.origin}/invite/${token}`;
    setInviteLink(link);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Convidar novo membro</h2>
        <p className="text-sm text-gray-500 mb-4">
          Adicione alguém para compartilhar sua família FinanSmart.
        </p>

        <input
          type="email"
          placeholder="E-mail do convidado"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none mb-3"
        />

        <button
          onClick={generateInvite}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow transition"
        >
          {loading ? "Gerando..." : "Gerar Convite"}
        </button>

        {inviteLink && (
          <div className="mt-5 bg-gray-50 border rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs text-gray-600 break-all">{inviteLink}</span>
            <button
              onClick={() => navigator.clipboard.writeText(inviteLink)}
              className="p-1 hover:bg-gray-200 rounded"
              title="Copiar link"
            >
              <Copy className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
