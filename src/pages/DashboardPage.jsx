import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { Lightbulb, TrendingUp, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Variantes de animação
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Componente de Card de Resumo (Renda, Despesas)
function SummaryCard({ title, value, colorClass, delay = 0 }) {
  return (
    <motion.div
      className="p-4 bg-white rounded-xl shadow-md"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5, delay: delay * 0.1 }}
    >
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`text-lg font-bold ${colorClass}`}>
        {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { household } = useFinance();
  const { loading, categories, transactions } = useFinance();

  // Cálculo dos totais (Saldo, Renda, Despesas)
  const financials = useMemo(() => {
    const totalRenda = transactions
      .filter(t => t.tipo === 'Income' || t.valor > 0)
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const totalDespesas = transactions
      .filter(t => t.tipo === 'Expense' || t.valor < 0)
      .reduce((sum, t) => sum + Math.abs(Number(t.valor)), 0);
      
    const saldo = totalRenda - totalDespesas;
    const totalDespesasFixas = 0; // Placeholder

    return { saldo, totalRenda, totalDespesas, totalDespesasFixas };
  }, [transactions]);

  // Cálculo dos dados para o Gráfico
  const categoryChartData = useMemo(() => {
    const expenseCategories = categories.filter(c => c.tipo === 'Expense');
    const expenseTransactions = transactions.filter(t => t.tipo ==='Expense' || t.valor < 0);

    return expenseCategories.map(cat => {
      const total = expenseTransactions
        .filter(t => t.category_id === cat.id)
        .reduce((sum, t) => sum + Math.abs(Number(t.valor)), 0);
      
      return {
        id: cat.id,
        nome: cat.nome,
        total: total,
        color_hex: cat.color_hex || '#CCC',
      };
    }).filter(cat => cat.total > 0); 

  }, [categories, transactions]);


  if (loading) {
    return (
      // Ajustado para centralizar no layout
      <div className="flex items-center justify-center w-full h-full min-h-full">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="ml-4 text-lg text-slate-700">Carregando seus dados...</p>
      </div>
    );
  }

  // Wrapper para centralizar o conteúdo
  // ======================================================
  // CORREÇÃO APLICADA AQUI (min-h-full)
  // ======================================================
  return (
    <div className="flex justify-center items-start w-full min-h-full p-4 md:p-8 overflow-y-auto">
      
      {/* Container Principal (O "Vidro") */}
      <div 
        className="w-full max-full
                   bg-white/50 backdrop-blur-lg 
                   border border-white/20 
                   rounded-3xl shadow-xl p-6"
      >
        
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-slate-700">
            {household ? `Bem-vindo à ${household.nome_familia}` : 'Bem-vindo!'}
          </p> 
        </header>

        {/* Card de Saldo (sólido) */}
        <motion.div
          className="w-full p-6 text-center bg-white rounded-2xl shadow-lg mb-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
        >
          <p className="text-lg text-slate-500">Saldo Atual</p>
          <h2 className="text-4xl font-bold text-gray-900">
            {financials.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </h2>
        </motion.div>

        {/* Grid de Resumo (sólidos) */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <SummaryCard 
            title="Renda" 
            value={financials.totalRenda} 
            colorClass="text-green-600"
            delay={1}
          />
          <SummaryCard 
            title="Despesas" 
            value={financials.totalDespesas} 
            colorClass="text-red-600"
            delay={2}
          />
          <SummaryCard 
            title="Desp. Fixas" 
            value={financials.totalDespesasFixas}
            colorClass="text-slate-700"
            delay={3}
          />
        </div>

        {/* Seção de Gastos (COM GRÁFICO REAL) */}
        <motion.div 
          className="mb-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Gastos por Categoria</h3>
          
          {categoryChartData.length > 0 ? (
            <div className="flex items-center">
              {/* Lado Esquerdo: O Gráfico */}
              <div className="w-2/5">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="total"
                      nameKey="nome"
                      cx="50%"
                      cy="50%"
                      innerRadius={40} 
                      outerRadius={60} 
                      paddingAngle={5}
                    >
                      {categoryChartData.map((entry) => (
                        <Cell key={`cell-${entry.id}`} fill={entry.color_hex} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Lado Direito: A Legenda */}
              <div className="w-3/5 pl-4 space-y-2">
                {categoryChartData.map(cat => (
                  <div key={cat.id} className="flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: cat.color_hex }}
                    ></span>
                    <span className="text-sm text-slate-700">{cat.nome}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Fallback (agora com fundo semi-transparente)
            <div className="p-4 bg-white/50 rounded-xl">
              <p className="text-sm text-slate-600 text-center">
                Você ainda não cadastrou nenhuma despesa.
              </p>
            </div>
          )}
        </motion.div>

        {/* Insights da IA (cards sólidos) */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Insights da IA</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl shadow-md">
              <Lightbulb className="w-6 h-6 mb-2 text-indigo-600" />
              <p className="text-sm text-slate-700">
                (Insight sobre otimização de gastos virá aqui)
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-md">
              <TrendingUp className="w-6 h-6 mb-2 text-indigo-600" />
              <p className="text-sm text-slate-700">
                (Previsão de potencial de investimento virá aqui)
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}