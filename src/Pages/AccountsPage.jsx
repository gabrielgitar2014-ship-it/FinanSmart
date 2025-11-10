import { useNavigate } from 'react-router-dom';
import { useFinance } from '../context/FinanceContext';
import { Plus } from 'lucide-react';
import AccountCardVisual from '../components/AccountCardVisual'; // Importa o componente do cartão

// A Página Principal
export default function AccountsPage() {
  const { accounts, loading } = useFinance();
  const navigate = useNavigate();

  return (
    <div className="flex justify-left items-start w-full min-h-full p-4 md:p-8 overflow-y-auto">
      
      {/* Container Principal (estilo 'vidro', mais largo) */}
      <div 
        className="w-full max-full 
                   bg-white/50 backdrop-blur-lg 
                   border border-white/20 
                   rounded-3xl shadow-xl p-6"
      >
        
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Meus Cartões e Contas</h1>
          <button
            onClick={() => navigate('/add-account')} // Navega para a página de adicionar
            className="p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all"
            title="Adicionar nova conta"
          >
            <Plus className="w-6 h-6" />
          </button>
        </header>

        {/* Lista de Contas (em Grade) */}
        {loading ? (
          <p className="text-center text-slate-600">Carregando contas...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {accounts.length > 0 ? (
              accounts.map(account => (
                <AccountCardVisual key={account.id} account={account} />
              ))
            ) : (
              // Mensagem de "Estado Vazio"
              <div className="p-4 bg-white/50 rounded-xl lg:col-span-2">
                <p className="text-sm text-slate-600 text-center">
                  Você ainda não cadastrou nenhuma conta. 
                  Clique no botão '+' para começar.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}