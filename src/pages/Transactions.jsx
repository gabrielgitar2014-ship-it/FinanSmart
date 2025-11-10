import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { useFinance } from "../context/FinanceContext";
import { useMonth } from "../context/MonthContext";
import { CreditCard, Wallet } from "lucide-react";

/**
 * 💳 Transactions Page
 *
 * Mostra as despesas e rendas do mês ativo.
 * Agora o botão "+" foi removido (controlado globalmente via FAB no AppLayout).
 */

export default function Transactions() {
  const { household } = useFinance();
  const { selectedMonth } = useMonth();

  const [transactions, setTransactions] = useState([]);
  const [viewType, setViewType] = useState("despesa");
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
  const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

  /* ===============================
     🔄 Carregar transações do Supabase
     =============================== */
  useEffect(() => {
    if (!household) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*, categories(nome, color_hex), accounts(nome_conta, tipo)")
        .eq("household_id", household)
        .eq("tipo", viewType)
        .gte("data", startOfMonth.toISOString())
        .lte("data", endOfMonth.toISOString())
        .order("data", { ascending: false });

      if (!error && data) {
        setTransactions(data);
        const totalCalc = data.reduce((acc, t) => acc + Number(t.valor || 0), 0);
        setTotal(totalCalc);
      }
      setLoading(false);
    };
    load();
  }, [selectedMonth, viewType, household]);

  /* ===============================
     💰 Formatações
     =============================== */
  const formatCurrency = (v) =>
    Number(v).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  /* ===============================
     🎨 Renderização
     =============================== */
  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-lg shadow-lg rounded-2xl p-5"
      >
        {/* Seletor Despesa/Renda */}
        <div className="flex justify-center gap-3 mb-5">
          <button
            onClick={() => setViewType("despesa")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              viewType === "despesa"
                ? "bg-red-500 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Despesas
          </button>
          <button
            onClick={() => setViewType("renda")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              viewType === "renda"
                ? "bg-green-500 text-white shadow"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Rendas
          </button>
        </div>

        {/* Total */}
        <div className="text-center text-sm mb-4">
          <span className="text-gray-700 font-medium">Total: </span>
          <span
            className={`font-semibold ${
              viewType === "despesa" ? "text-red-600" : "text-green-600"
            }`}
          >
            {formatCurrency(total)}
          </span>
        </div>

        {/* Lista de transações */}
        <div className="space-y-3 max-h-[65vh] overflow-y-auto hide-scrollbar">
          {loading ? (
            <div className="text-center text-gray-500 py-10">Carregando...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              Nenhuma {viewType === "despesa" ? "despesa" : "renda"} neste mês.
            </div>
          ) : (
            <AnimatePresence>
              {transactions.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-between items-center bg-white/90 backdrop-blur-md shadow-sm rounded-2xl p-3 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-full shadow-sm"
                      style={{
                        backgroundColor:
                          t.categories?.color_hex ||
                          (viewType === "despesa" ? "#EF4444" : "#16A34A"),
                      }}
                    >
                      {t.accounts?.tipo === "credit" ? (
                        <CreditCard className="text-white w-5 h-5" />
                      ) : (
                        <Wallet className="text-white w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {t.descricao}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(t.data)} — {t.accounts?.nome_conta}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      viewType === "despesa" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {formatCurrency(t.valor)}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
}
