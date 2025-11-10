import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importar useNavigate
import { Loader2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

// Hook para formatar data para o input (YYYY-MM-DD)
const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

export default function NewTransactionPage() {
  const { accounts, categories, addTransaction } = useFinance();
  const navigate = useNavigate(); // 2. Inicializar o hook
  
  // Estado do formulário
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState('Expense');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [data, setData] = useState(getTodayString());
  const [observacoes, setObservacoes] = useState('');

  // Filtra categorias e contas com base no TIPO
  const availableCategories = categories.filter(c => c.tipo === tipo);
  const availableAccounts = accounts; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const transactionData = {
      descricao,
      valor: tipo === 'Expense' ? -Math.abs(Number(valor)) : Number(valor),
      category_id: categoryId,
      account_id: accountId,
      data: data,
      observacoes,
      tipo: tipo,
    };

    try {
      await addTransaction(transactionData);
      navigate('/dashboard'); // 3. Sucesso: Volta ao Dashboard
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      setLoading(false);
    }
  };

  // 4. Renderiza como uma página, não um modal
  return (
    <div className="flex justify-center items-start w-full min-h-full p-4 md:p-8 overflow-y-auto">
      <div className="w-full max-w-full bg-gray-100 rounded-3xl shadow-xl">
        <form onSubmit={handleSubmit}>
          {/* --- Cabeçalho da Página --- */}
          <header className="flex items-center justify-between p-4 border-b">
            <button 
              type="button" 
              className="text-indigo-600"
              onClick={() => navigate(-1)} // 5. "Cancelar" volta para a pág. anterior
            >
              Cancelar
            </button>
            <h2 className="font-semibold text-lg">Nova {tipo === 'Expense' ? 'Despesa' : 'Receita'}</h2>
            <button 
              type="submit" 
              className="text-indigo-600 font-bold"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Salvar'}
            </button>
          </header>

          {/* --- Corpo do Formulário --- */}
          <div className="p-6 space-y-4">
            
            {/* --- Seletor de Tipo (Despesa/Receita) --- */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200 rounded-lg">
              <button 
                type="button"
                className={`p-2 rounded-md font-semibold ${tipo === 'Expense' ? 'bg-white shadow' : 'text-gray-600'}`}
                onClick={() => setTipo('Expense')}
              >
                Despesa
              </button>
              <button
                type="button"
                className={`p-2 rounded-md font-semibold ${tipo === 'Income' ? 'bg-white shadow' : 'text-gray-600'}`}
                onClick={() => setTipo('Income')}
              >
                Receita
              </button>
            </div>

            {/* --- Input de Valor --- */}
            <div className="text-center">
              <span className="text-sm text-gray-600">Valor da {tipo === 'Expense' ? 'Despesa' : 'Receita'}</span>
              <input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="R$ 0,00"
                required
                className={`w-full text-center text-4xl font-bold bg-transparent border-none focus:ring-0
                           ${tipo === 'Expense' ? 'text-black-600' : 'text-green-600'}`}
              />
            </div>

            {/* --- Inputs em Cards --- */}
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl shadow-sm space-y-4">
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descrição (Ex: Almoço, Cinema)"
                  required
                  className="w-full border-b border-gray-200 focus:border-indigo-500 focus:ring-0"
                />
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full border-b border-gray-200 focus:border-indigo-500 focus:ring-0"
                >
                  <option value="" disabled>Categoria</option>
                  {availableCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                  className="w-full border-b border-gray-200 focus:border-indigo-500 focus:ring-0"
                />
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                  className="w-full border-none focus:ring-0" // Último item sem borda
                >
                  <option value="" disabled>Forma de Pagamento (Conta)</option>
                  {availableAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.nome_conta}</option>
                  ))}
                </select>
              </div>
              
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações"
                  rows="2"
                  className="w-full border-none focus:ring-0 resize-none"
                />
              </div>
            </div>

            {/* --- Botão Salvar (Fixo no rodapé) --- */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-4 rounded-xl text-white font-bold text-lg
                        ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}