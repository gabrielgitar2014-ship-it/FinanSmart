import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, CreditCard, ChevronRight, Layers } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useFinance } from "../context/FinanceContext";
import { useMonth } from "../context/MonthContext";

/* ===============================
   Função auxiliar: lógica de fatura
   =============================== */
const getBillingMonth = (transactionDate, closeDay) => {
  const d = new Date(transactionDate);
  const billingDate = new Date(d);
  if (d.getDate() > closeDay) billingDate.setMonth(d.getMonth() + 1);
  return billingDate;
};

/* ===============================
   Função auxiliar: corrige timezone
   =============================== */
const parseLocalDate = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // define meio-dia para evitar offset
};

export default function TransactionModal({ open, onClose, defaultType = "despesa" }) {
  const { household, accounts, categories, refresh } = useFinance();
  const { selectedMonth } = useMonth();

  const [tipo, setTipo] = useState(defaultType);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [parcelado, setParcelado] = useState(false);
  const [totalParcelas, setTotalParcelas] = useState(1);
  const [loading, setLoading] = useState(false);

  const selectedAccount = accounts?.find((a) => a.id === accountId);
  const isCredit = selectedAccount?.tipo === "credit";

  /* ===============================
     Função principal: salvar transação
     =============================== */
  const handleSave = async () => {
    if (!descricao || !valor || !accountId || !categoryId)
      return alert("Preencha todos os campos obrigatórios.");

    try {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Usuário não autenticado.");

      // Corrige o timezone e gera data de cobrança
      let billingDate = parseLocalDate(data);
      if (isCredit && selectedAccount?.close_day)
        billingDate = getBillingMonth(data, selectedAccount.close_day);

      const valorNum = parseFloat(valor.replace(",", "."));
      const household_id = household;

      // Caso parcelado
      if (parcelado && totalParcelas > 1) {
        const parcelaValor = valorNum / totalParcelas;

        // Transação principal (pai)
        const { data: parent, error: parentError } = await supabase
          .from("transactions")
          .insert([
            {
              household_id,
              user_id: user.id,
              account_id: accountId,
              category_id: categoryId,
              descricao,
              valor: parcelaValor,
              data: billingDate.toISOString().split("T")[0], // salva apenas a data local
              tipo,
              total_parcelas: totalParcelas,
              parcela_atual: 1,
              observacoes,
              is_recorrente: false,
            },
          ])
          .select()
          .single();

        if (parentError) throw parentError;

        // Cria parcelas subsequentes
        for (let i = 1; i < totalParcelas; i++) {
          const nextDate = new Date(billingDate);
          nextDate.setMonth(nextDate.getMonth() + i);

          await supabase.from("transactions").insert({
            household_id,
            user_id: user.id,
            account_id: accountId,
            category_id: categoryId,
            descricao: `${descricao} (${i + 1}/${totalParcelas})`,
            valor: parcelaValor,
            data: nextDate.toISOString().split("T")[0], // salva apenas data local
            tipo,
            parcela_atual: i + 1,
            total_parcelas: totalParcelas,
            id_transacao_pai: parent.id,
            observacoes,
            is_recorrente: false,
          });
        }
      } else {
        // Transação simples
        await supabase.from("transactions").insert({
          household_id,
          user_id: user.id,
          account_id: accountId,
          category_id: categoryId,
          descricao,
          valor: valorNum,
          data: billingDate.toISOString().split("T")[0], // salva só a data local
          tipo,
          observacoes,
          is_recorrente: false,
        });
      }

      await refresh();
      onClose();
    } catch (e) {
      console.error("Erro ao salvar transação:", e);
      alert("Erro ao salvar transação.");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     Renderização do modal
     =============================== */
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Fundo escurecido */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 12 }}
            className="relative z-50 w-full max-w-sm mx-3 bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            {/* Cabeçalho */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
              <button
                onClick={onClose}
                className="text-blue-600 font-medium hover:underline"
              >
                Cancelar
              </button>
              <h2 className="text-sm font-semibold text-gray-800">
                Nova {tipo === "despesa" ? "Despesa" : "Renda"}
              </h2>
              <button
                onClick={handleSave}
                disabled={loading}
                className="text-blue-600 font-medium hover:underline"
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>

            {/* Valor */}
            <div className="text-center py-4 border-b border-gray-100">
              <p className="text-gray-600 text-sm mb-1">Valor</p>
              <input
                type="text"
                inputMode="decimal"
                value={valor}
                onChange={(e) =>
                  setValor(e.target.value.replace(/[^\d,]/g, ""))
                }
                placeholder="0,00"
                className="w-full text-center text-3xl font-semibold text-gray-900 outline-none bg-transparent"
              />
            </div>

            {/* Campos principais */}
            <div className="flex flex-col gap-3 p-4">
              {/* Descrição */}
              <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
                <label className="text-xs text-gray-500 block mb-1">
                  Descrição
                </label>
                <input
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Almoço, Cinema..."
                  className="w-full bg-transparent text-sm text-gray-800 outline-none"
                />
              </div>

              {/* Categoria */}
              <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 flex items-center justify-between">
                <div className="w-full">
                  <label className="text-xs text-gray-500 block mb-1">
                    Categoria
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="bg-transparent text-sm text-gray-800 outline-none w-full"
                  >
                    <option value="">Escolha...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
              </div>

              {/* Data */}
              <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 flex items-center justify-between">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Data</label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="bg-transparent text-sm text-gray-800 outline-none"
                  />
                </div>
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>

              {/* Forma de pagamento */}
              <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 flex items-center justify-between">
                <div className="w-full">
                  <label className="text-xs text-gray-500 block mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="bg-transparent text-sm text-gray-800 outline-none w-full"
                  >
                    <option value="">Selecione</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nome_conta}
                      </option>
                    ))}
                  </select>
                </div>
                <CreditCard className="w-4 h-4 text-gray-400 ml-2" />
              </div>

              {/* Parcelamento (apenas para cartões) */}
              {isCredit && (
                <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-500 flex items-center gap-2">
                      Parcelar compra
                    </label>
                    <input
                      type="checkbox"
                      checked={parcelado}
                      onChange={(e) => setParcelado(e.target.checked)}
                      className="w-4 h-4 accent-blue-600"
                    />
                  </div>

                  {parcelado && (
                    <div className="mt-2 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gray-500" />
                      <input
                        type="number"
                        min="2"
                        max="24"
                        value={totalParcelas}
                        onChange={(e) =>
                          setTotalParcelas(Number(e.target.value))
                        }
                        className="w-20 p-1 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-300"
                      />
                      <span className="text-xs text-gray-500">
                        parcelas mensais
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Observações */}
              <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
                <label className="text-xs text-gray-500 block mb-1">
                  Observações
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Adicione detalhes, lembretes ou notas..."
                  rows="2"
                  className="w-full bg-transparent text-sm text-gray-800 outline-none resize-none"
                />
              </div>
            </div>

            {/* Botão principal */}
            <div className="px-4 pb-6">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-md transition"
              >
                {loading ? "Salvando..." : "Salvar Transação"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
