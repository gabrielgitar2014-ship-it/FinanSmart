import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useFinance } from "../context/FinanceContext";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, UserPlus, Mail, Loader2, Copy, Share2 } from "lucide-react";

export default function Members() {
  const { household } = useFinance();
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingInvite, setCreatingInvite] = useState(false);
  
  // ESTADOS DO MODAL DE COMPARTILHAMENTO
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentInviteLink, setCurrentInviteLink] = useState("");
  const [linkRecipientEmail, setLinkRecipientEmail] = useState("");


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
      .eq("status", "pending") // Filtra apenas convites pendentes
      .order("created_at", { ascending: false });

    if (!error && data) setInvites(data);
  };

  /* ========================================
     ✉️ Criar convite (Gera Link e Abre Modal)
     ======================================== */
  const handleCreateInvite = async () => {
    if (!newEmail) return alert("Digite um e-mail para convite.");
    setCreatingInvite(true);

    const emailToInvite = newEmail.trim().toLowerCase();

    try {
        // Chamada à Edge Function que cria o convite no banco e gera o link
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
            alert(`Erro ao gerar convite: ${data?.message || error?.message}`);
            return;
        }
        
        const link = data.inviteUrl; 

        setNewEmail("");
        
        // Armazena o link para exibição no modal
        setCurrentInviteLink(link);
        setLinkRecipientEmail(emailToInvite);
        setShowShareModal(true); 
        
        await loadInvitations(); // Recarrega a lista
        
    } catch (e) {
        console.error("Erro na chamada da Edge Function:", e);
        alert("Erro ao tentar chamar o servidor.");
    } finally {
        setCreatingInvite(false);
    }
  };

  /* ========================================
     📋 Funções de Ação do Link
     ======================================== */
  const copyToClipboard = async () => {
    if (currentInviteLink) {
        try {
            await navigator.clipboard.writeText(currentInviteLink);
            alert("Link copiado para a área de transferência!");
        } catch (err) {
            console.error("Falha ao copiar o link:", err);
            alert("Não foi possível copiar o link. Por favor, copie manualmente.");
        }
    }
  };

  const shareLink = async () => {
    if (navigator.share && currentInviteLink) {
        try {
            await navigator.share({
                title: 'Convite para FinanSmart',
                text: `Você foi convidado para participar da família FinanSmart no e-mail ${linkRecipientEmail}!`,
                url: currentInviteLink,
            });
            console.log('Link compartilhado com sucesso!');
        } catch (error) {
            console.error('Erro ao compartilhar:', error);
        }
    } else {
        // Fallback para navegadores sem a Web Share API
        alert('A função de compartilhamento não está disponível no seu navegador. O link foi copiado automaticamente.');
        copyToClipboard();
    }
  };

  /* ========================================
     🗑️ Revogar convite (Exclusão Lógica)
     ======================================== */
  const revokeInvite = async (id) => {
    if (!confirm("Deseja realmente revogar este convite?")) return;
    
    // ✅ CORRIGIDO: Agora a coluna 'revoked_at' existe e a atualização funcionará
    const { error } = await supabase
      .from("invitations")
      .update({ 
          status: "expired",
          revoked_at: new Date().toISOString() // Coluna adicionada via SQL
      }) 
      .eq("id", id);
      
    if (error) {
        console.error("Erro ao revogar convite:", error);
        alert("Falha ao revogar o convite devido a um erro no servidor.");
        return;
    }
    
    // Recarrega a lista, que só mostra status 'pending', removendo o item
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
      
      {/* Modal de Compartilhamento do Link - NOVO COMPONENTE */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg- bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowShareModal(false)} // Fecha ao clicar fora
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()} // Impede o fechamento ao clicar dentro
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Convite Gerado!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Copie ou compartilhe este link para convidar{" "}
                <span className="font-medium text-blue-600">{linkRecipientEmail}</span>:
              </p>
              
              {/* Campo de exibição do link */}
              <div className="bg-gray-100 border border-gray-200 rounded-md p-3 mb-4 text-sm text-gray-700 break-all select-all">
                {currentInviteLink}
              </div>
              
              {/* Botões de Ação */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-1 transition"
                >
                  <Copy className="w-4 h-4" /> Copiar
                </button>
                
                {/* Botão de Compartilhamento (Web Share API) */}
                {navigator.share && (
                  <button
                    onClick={shareLink}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-1 transition"
                  >
                    <Share2 className="w-4 h-4" /> Compartilhar
                  </button>
                )}
                
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg text-sm font-medium transition"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}