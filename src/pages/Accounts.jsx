import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Wifi,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useFinance } from "../context/FinanceContext";
import WalletCardSelector from "../components/WalletCardSelector";

/* ------------------------
   Utilitários auxiliares
------------------------- */
const COLOR_PALETTE = [
  "#4F46E5", "#0EA5E9", "#16A34A", "#EF4444",
  "#F97316", "#1F2937", "#10B981", "#A855F7",
  "#FACC15", "#3B82F6"
];

function formatCurrencyBR(value) {
  const num = Number(value) || 0;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function shade(hex, percent) {
  try {
    const _hex = hex.replace("#", "");
    const num = parseInt(_hex, 16);
    const r = (num >> 16) + percent;
    const g = ((num >> 8) & 0x00ff) + percent;
    const b = (num & 0x0000ff) + percent;
    const clamp = (v) => Math.max(0, Math.min(255, v));
    return (
      "#" +
      clamp(r).toString(16).padStart(2, "0") +
      clamp(g).toString(16).padStart(2, "0") +
      clamp(b).toString(16).padStart(2, "0")
    );
  } catch {
    return hex;
  }
}

/* ------------------------
   Componente principal
------------------------- */
export default function Accounts() {
  const { accounts = [], household, refresh } = useFinance();

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [nomeConta, setNomeConta] = useState("");
  const [issuerId, setIssuerId] = useState("");
  const [bandeira, setBandeira] = useState("");
  const [corPersonalizada, setCorPersonalizada] = useState(COLOR_PALETTE[0]);
  const [ultimos4, setUltimos4] = useState("");
  const [tipo, setTipo] = useState("checking");
  const [closeDay, setCloseDay] = useState("");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (openModal && modalRef.current && !modalRef.current.contains(e.target)) {
        setOpenModal(false);
        setEditing(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openModal]);

  /* ------------------------
     CRUD
  ------------------------- */
  const openCreate = () => {
    setEditing(null);
    setNomeConta("");
    setIssuerId("");
    setBandeira("");
    setCorPersonalizada(COLOR_PALETTE[0]);
    setUltimos4("");
    setTipo("checking");
    setCloseDay("");
    setOpenModal(true);
  };

  const openEdit = (acc) => {
    setEditing(acc);
    setNomeConta(acc.nome_conta || "");
    setIssuerId(acc.issuer_id || "");
    setBandeira(acc.bandeira || "");
    setCorPersonalizada(acc.cor_personalizada || COLOR_PALETTE[0]);
    setUltimos4(acc.ultimos_4_digitos || "");
    setTipo(acc.tipo || "checking");
    setCloseDay(acc.close_day ? String(acc.close_day) : "");
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!nomeConta.trim() && !issuerId.trim())
      return alert("Informe o nome da conta ou selecione um emissor.");
    if (tipo === "credit" && (ultimos4.length !== 4 || !/^\d{4}$/.test(ultimos4)))
      return alert("Informe os 4 últimos dígitos do cartão.");

    try {
      setLoading(true);
      const payload = {
        household_id: household,
        nome_conta: nomeConta.trim() || issuerId,
        issuer_id: issuerId,
        bandeira,
        cor_personalizada: corPersonalizada,
        ultimos_4_digitos: ultimos4 || null,
        tipo,
        close_day: closeDay ? Number(closeDay) : null,
      };

      if (editing)
        await supabase.from("accounts").update(payload).eq("id", editing.id);
      else await supabase.from("accounts").insert(payload);

      await refresh();
      setOpenModal(false);
      setEditing(null);
    } catch (e) {
      console.error("Erro ao salvar conta:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deseja excluir esta conta?")) return;
    await supabase.from("accounts").delete().eq("id", id);
    await refresh();
  };

  /* ------------------------
     Card de preview compacto
  ------------------------- */
  const CardPreview = ({ acc }) => {
    const color = acc.cor_personalizada || "#4F46E5";
    const last4 = acc.ultimos_4_digitos || "----";
    const issuerName = acc.nome_conta || acc.issuer_id || "Conta";

    return (
      <motion.div
        style={{
          background: `linear-gradient(145deg, ${color}, ${shade(color, -20)})`,
        }}
        className="relative rounded-lg p-3 text-white shadow-md min-h-[95px] flex flex-col justify-between transition-transform hover:scale-[1.02]"
      >
        <div className="flex justify-between items-start">
          <div className="text-sm font-semibold">{issuerName}</div>
          <Wifi className="w-4 h-4 opacity-80" />
        </div>

        <div className="tracking-widest text-xs mt-1">
          <span className="opacity-70">•••• •••• •••• </span>
          <span className="font-medium">{last4}</span>
        </div>

        <div className="flex items-end justify-between mt-1">
          <div>
            <div className="text-[10px] opacity-80">Gastos</div>
            <div className="text-base font-bold">
              {formatCurrencyBR(acc.balance ?? 0)}
            </div>
          </div>
          <div className="w-7 h-7 rounded-md bg-white/25 flex items-center justify-center">
            <span className="text-[9px] uppercase">{acc.bandeira}</span>
          </div>
        </div>

        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() => openEdit(acc)}
            className="bg-white/80 p-1 rounded-full hover:scale-95 transition"
          >
            <Edit2 className="w-3.5 h-3.5 text-gray-700" />
          </button>
          <button
            onClick={() => handleDelete(acc.id)}
            className="bg-white/80 p-1 rounded-full hover:scale-95 transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
          </button>
        </div>
      </motion.div>
    );
  };

  /* ------------------------
     Renderização principal
  ------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/80 to-green-50/80 flex flex-col px-3 py-8 md:px-6">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg md:text-xl font-semibold text-gray-800">
            Meus Cartões e Contas
          </h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>

        {/* Grid de cartões */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts?.map((acc) => (
            <CardPreview key={acc.id} acc={acc} />
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
            />
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              className="relative z-50 w-full max-w-md md:max-w-lg mx-3 rounded-xl bg-white/90 backdrop-blur-md border border-white/30 shadow-xl p-4 md:p-5 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base md:text-lg font-semibold text-gray-800">
                  {editing ? "Editar Conta" : "Nova Conta"}
                </h2>
                <button
                  onClick={() => {
                    setOpenModal(false);
                    setEditing(null);
                  }}
                  className="p-1 rounded-md hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Seletor de cartões */}
              <WalletCardSelector
                selectedCard={{
                  issuer: issuerId,
                  bandeira,
                  color: corPersonalizada,
                }}
                onSelect={(card) => {
                  if (!card) {
                    setIssuerId("");
                    setBandeira("");
                    setNomeConta("");
                    return;
                  }
                  setIssuerId(card.issuer);
                  setBandeira(card.bandeira);
                  setCorPersonalizada(card.color);
                  setNomeConta(card.issuer);
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-sm">
                <div className="space-y-2">
                  <input
                    value={nomeConta}
                    onChange={(e) => setNomeConta(e.target.value)}
                    placeholder="Nome do emissor (opcional)"
                    className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300"
                  />

                  <div className="flex gap-1.5 flex-wrap">
                    {["checking", "credit", "investment", "cash"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTipo(t)}
                        className={`px-2 py-1.5 rounded-md border ${
                          tipo === t
                            ? "border-blue-500 bg-white"
                            : "border-gray-300 bg-gray-50"
                        }`}
                      >
                        {t === "checking"
                          ? "Conta"
                          : t === "credit"
                          ? "Cartão"
                          : t === "investment"
                          ? "Investimento"
                          : "Carteira"}
                      </button>
                    ))}
                  </div>

                  <input
                    value={ultimos4}
                    onChange={(e) =>
                      setUltimos4(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="Últimos 4 dígitos (cartão)"
                    className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                <div className="space-y-2">
                  <input
                    value={closeDay}
                    onChange={(e) =>
                      setCloseDay(e.target.value.replace(/\D/g, "").slice(0, 2))
                    }
                    placeholder="Dia fechamento fatura"
                    className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300"
                  />

                  {/* Paleta de cor visível só no modo personalizar */}
                  {!issuerId && (
                    <div className="space-y-1 mt-1">
                      <label className="text-xs text-gray-600">
                        Escolha uma cor:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_PALETTE.map((c) => (
                          <button
                            key={c}
                            onClick={() => setCorPersonalizada(c)}
                            className={`w-8 h-8 rounded-md border-2 ${
                              corPersonalizada === c
                                ? "border-blue-500 ring-2 ring-blue-200"
                                : "border-gray-300"
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <input
                          type="text"
                          value={corPersonalizada}
                          onChange={(e) =>
                            setCorPersonalizada(e.target.value)
                          }
                          placeholder="#000000"
                          className="w-24 p-1 rounded-md border border-gray-300 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  <div className="text-xs text-gray-600 mt-2">Preview:</div>
                  <div
                    style={{
                      background: `linear-gradient(145deg, ${corPersonalizada}, ${shade(
                        corPersonalizada,
                        -15
                      )})`,
                    }}
                    className="rounded-lg p-3 text-white text-xs min-h-[85px] flex flex-col justify-between"
                  >
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm">
                        {nomeConta || issuerId || "Conta"}
                      </span>
                      <Wifi className="w-4 h-4 opacity-80" />
                    </div>
                    <div className="tracking-widest text-[11px] mt-1">
                      •••• •••• •••• {ultimos4 || "----"}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[10px] opacity-80">Fatura</div>
                        <div className="text-sm font-bold">
                          {closeDay ? `Dia ${closeDay}` : "-"}
                        </div>
                      </div>
                      <div className="w-7 h-7 bg-white/25 flex items-center justify-center rounded-md">
                        <span className="text-[10px] uppercase">
                          {bandeira}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setOpenModal(false);
                    setEditing(null);
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  {loading ? "Salvando..." : editing ? "Salvar" : "Criar Conta"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
