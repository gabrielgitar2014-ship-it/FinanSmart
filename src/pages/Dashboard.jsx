import { useFinance } from "../context/FinanceContext";
import { Lightbulb, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { loading, error, accounts, transactions, categories } = useFinance();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        <p>Carregando dados financeiros...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <p>Erro: {error}</p>
      </div>
    );

  // --- Cálculos de valores ---
  const saldoTotal =
    accounts?.reduce(
      (sum, acc) => sum + parseFloat(acc.initial_balance || 0),
      0
    ) || 0;

  const totalReceitas =
    transactions
      ?.filter((t) => t.tipo === "receita")
      .reduce((sum, t) => sum + parseFloat(t.valor || 0), 0) || 0;

  const totalDespesas =
    transactions
      ?.filter((t) => t.tipo === "despesa")
      .reduce((sum, t) => sum + parseFloat(t.valor || 0), 0) || 0;

  const despesasFixas =
    transactions
      ?.filter((t) => t.is_recorrente)
      .reduce((sum, t) => sum + parseFloat(t.valor || 0), 0) || 0;

  const saldoFinal = saldoTotal + totalReceitas - totalDespesas;

  // --- Agrupamento de gastos por categoria ---
  const despesasPorCategoria = categories
    ?.map((cat) => {
      const totalCat = transactions
        .filter((t) => t.category_id === cat.id && t.tipo === "despesa")
        .reduce((sum, t) => sum + parseFloat(t.valor || 0), 0);
      return {
        name: cat.nome,
        value: totalCat,
        color: cat.color_hex || "#4F46E5",
      };
    })
    .filter((c) => c.value > 0);

  return (
    <div className="min-h-screen flex justify-center items-start px-4 py-8 md:py-16 bg-gradient-to-br from-blue-50/80 to-green-50/80">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Coluna da esquerda */}
        <motion.div
          className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-3xl shadow-lg p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-center text-xl font-semibold text-gray-800">
            Dashboard
          </h1>

          {/* Card principal - Saldo */}
          <div className="rounded-2xl p-6 text-center backdrop-blur-lg bg-blue-50/70 border border-blue-100/40 shadow-sm">
            <h2 className="text-sm text-gray-600">Saldo Consolidado</h2>
            <p className="text-4xl font-bold text-blue-900">
              R$ {saldoFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Resumo de renda e despesas */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl backdrop-blur-lg bg-green-50/70 border border-green-100/40 shadow-sm">
              <p className="text-xs text-gray-600">Renda</p>
              <p className="text-green-600 font-semibold text-sm">
                R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-4 rounded-xl backdrop-blur-lg bg-red-50/70 border border-red-100/40 shadow-sm">
              <p className="text-xs text-gray-600">Despesas</p>
              <p className="text-red-600 font-semibold text-sm">
                R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-4 rounded-xl backdrop-blur-lg bg-gray-50/70 border border-gray-100/40 shadow-sm">
              <p className="text-xs text-gray-600">Fixas</p>
              <p className="text-gray-800 font-semibold text-sm">
                R$ {despesasFixas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Gráfico */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Gastos por Categoria
            </h3>

            <div className="flex flex-col items-center">
              {despesasPorCategoria.length > 0 ? (
                <ResponsiveContainer width="80%" height={160}>
                  <PieChart>
                    <Pie
                      data={despesasPorCategoria}
                      innerRadius={40}
                      outerRadius={60}
                      dataKey="value"
                    >
                      {despesasPorCategoria.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-sm">Nenhum dado disponível</p>
              )}

              <div className="flex justify-center gap-4 mt-2 text-xs text-gray-600 flex-wrap">
                {despesasPorCategoria.map((d) => (
                  <div key={d.name} className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: d.color }}
                    ></span>
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Coluna da direita */}
        <motion.div
          className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-3xl shadow-lg p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-gray-800">
            Insights da IA
          </h3>

          <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="backdrop-blur-lg bg-blue-50/70 border border-blue-100/40 rounded-2xl p-4 shadow-sm flex flex-col gap-2"
            >
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-700">
                Seu saldo atual está{" "}
                <b>
                  {saldoFinal >= 0 ? "positivo" : "negativo"} em R$
                  {Math.abs(saldoFinal).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </b>.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="backdrop-blur-lg bg-green-50/70 border border-green-100/40 rounded-2xl p-4 shadow-sm flex flex-col gap-2"
            >
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-700">
                Suas despesas representam{" "}
                <b>
                  {((totalDespesas / (totalReceitas || 1)) * 100).toFixed(1)}%
                </b>{" "}
                da sua renda.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="backdrop-blur-lg bg-purple-50/70 border border-purple-100/40 rounded-2xl p-4 shadow-sm flex flex-col gap-2"
            >
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-700">
                Você possui{" "}
                <b>{transactions.length}</b> transações registradas neste mês.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="backdrop-blur-lg bg-yellow-50/70 border border-yellow-100/40 rounded-2xl p-4 shadow-sm flex flex-col gap-2"
            >
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-gray-700">
                Explore suas categorias para descobrir oportunidades de
                economia.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
