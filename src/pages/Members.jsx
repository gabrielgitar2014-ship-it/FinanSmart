import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useFinance } from "../context/FinanceContext";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, UserPlus, Mail, Loader2 } from "lucide-react";

export default function Members() {
  const { household } = useFinance();
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingInvite, setCreatingInvite] = useState(false);

  /* ========================================
     🔄 Carregar membros e convites
     ======================================== */
  useEffect(() => {
    if (!household) return;
    loadMembers();
    loadInvitations();
  }, [household]);

  const loadMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("household_members")
      .select(`
        user_id,
        role,
        profiles (id, nome_completo, avatar_url, email)
      `)
      .eq("household_id", household);

    if (!error && data) setMembers(data);
    setLoading(false);
  };

  const loadInvitations = async () => {
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("household_id", household)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!error && data) setInvites(data);
  };

  /* ========================================
     ✉️ Criar convite (CORRIGIDO: Chama Edge Function)
     ======================================== */
  const handleCreateInvite = async () => {
    if (!newEmail) return alert("Digite um e-mail para convite.");
    setCreatingInvite(true);

    const emailToInvite = newEmail.trim().toLowerCase();

    try {
        // ✅ CORREÇÃO: Chama a Edge Function 'invite'
        const { data, error } = await supabase.functions.invoke('invite', {
            method: 'POST',
            body: {
                household_id: household,
                inviter_id: user.id,
                email: emailToInvite,
            },
        });

        if (error || !data.success) {
            console.error(error || data.details);
            alert(`Erro ao enviar convite: ${data?.message || error?.message}`);
            return;
        }

        setNewEmail("");
        alert(`Convite enviado com sucesso para ${emailToInvite}!`);
        await loadInvitations(); // Recarrega a lista para mostrar o novo convite
        
    } catch (e) {
        console.error("Erro na chamada da Edge Function:", e);
        alert("Erro ao tentar chamar o servidor.");
    } finally {
        setCreatingInvite(false);
    }
  };

  /* ========================================
     🗑️ Revogar convite (Lógica de expirar/revogar correta)
     ======================================== */
  const revokeInvite = async (id) => {
    if (!confirm("Deseja realmente revogar este convite?")) return;
    await supabase
      .from("invitations")
      // ✅ Atualiza o status para 'expired' (revogado)
      .update({ status: "expired" }) 
      .eq("id", id);
    await loadInvitations();
  };

  /* ========================================
     ❌ Remover membro
     ======================================== */
  const removeMember = async (memberId) => {
    if (memberId === user.id) return alert("Você não pode se remover.");
    if (!confirm("Remover este membro da família?")) return;

    await supabase
      .from("household_members")
      .delete()
      .eq("household_id", household)
      .eq("user_id", memberId);

    await loadMembers();
  };

  /* ========================================
     📋 Renderização
     ======================================== */
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg w-full max-w-lg p-6"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Gerenciar Membros</h2>
        <p className="text-sm text-gray-500 mb-5">
          Convide e gerencie os membros da sua família FinanSmart.
        </p>

        {/* Membros ativos */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Membros Ativos</h3>
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum membro ainda.</p>
          ) : (
            <ul className="space-y-3">
              {members.map((m) => (
                <li
                  key={m.user_id}
                  className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={m.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${m.profiles?.nome_completo || "Usuário"}`}
                      alt="avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {m.profiles?.nome_completo || "Usuário sem nome"}
                      </p>
                      <p className="text-xs text-gray-500">{m.profiles?.email}</p>
                    </div>
                  </div>

                  {m.user_id !== user.id && (
                    <button
                      onClick={() => removeMember(m.user_id)}
                      className="p-2 rounded-full hover:bg-red-100"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Convites pendentes */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Convites Pendentes</h3>
          {invites.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum convite ativo.</p>
          ) : (
            <ul className="space-y-3">
              {invites.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-3"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {inv.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        Expira em{" "}
                        {new Date(inv.expires_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => revokeInvite(inv.id)}
                    className="p-2 rounded-full hover:bg-red-100"
                    title="Revogar"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Novo convite */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Convidar Novo Membro</h3>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="E-mail do convidado"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={handleCreateInvite}
              disabled={creatingInvite}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition"
            >
              {creatingInvite ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>Convidar</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}