import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Wifi, Wallet, DollarSign } from 'lucide-react';

// ======================================================
// CORREÇÃO APLICADA AQUI
// Importamos nossos próprios componentes SVG
// ======================================================
import VisaLogo from './icons/VisaLogo';
import MastercardLogo from './icons/MastercardLogo';
import AmexLogo from './icons/AmexLogo';
import EloLogo from './icons/EloLogo';
import HipercardLogo from './icons/HipercardLogo';

// Função auxiliar para pegar o logo da bandeira
function GetFlagLogo({ bandeira, className }) {
  // Agora usamos nossos componentes locais
  if (bandeira === 'Visa') return <VisaLogo className={className} />;
  if (bandeira === 'Mastercard') return <MastercardLogo className={className} />;
  if (bandeira === 'American Express') return <AmexLogo className={className} />;
  if (bandeira === 'Elo') return <EloLogo className={className} />;
  if (bandeira === 'Hipercard') return <HipercardLogo className={className} />;
  
  // O fallback para "Outro" permanece
  return <span className="text-xs font-bold">{bandeira}</span>;
}

export default function AccountCardVisual({ account }) {
  const { transactions } = useFinance();

  // Calcula o saldo/gastos da conta
  const balance = useMemo(() => {
    return transactions
      .filter(t => t.account_id === account.id)
      .reduce((sum, t) => sum + Number(t.valor), 0);
  }, [transactions, account.id]);

  const isCreditCard = account.tipo === 'Credit Card';

  // Renderização do Card
  return (
    <div
      className="w-full h-65 p-4 rounded-2xl shadow-lg
                 flex flex-col justify-between
                 text-white"
      style={{ backgroundColor: account.cor_personalizada || '#4B5563' }}
    >
      {/* --- Topo do Card --- */}
      <div className="flex justify-between items-center">
        <span className="font-semibold text-lg">{account.nome_conta}</span>
        {isCreditCard && <Wifi className="w-6 h-6" />}
        {account.tipo === 'Checking' && <Wallet className="w-6 h-6" />}
        {account.tipo === 'Cash' && <DollarSign className="w-6 h-6" />}
      </div>

      {/* --- Meio do Card --- */}
      {isCreditCard && (
        <div className="text-2xl font-mono tracking-widest">
          .... .... .... {account.ultimos_4_digitos || '0000'}
        </div>
      )}

      {/* --- Rodapé do Card --- */}
      <div>
        <span className="text-sm opacity-80">
          {isCreditCard ? 'Gastos' : 'Saldo'}
        </span>
        <div className="flex justify-between items-end">
          <span className="text-2xl font-bold">
            {(isCreditCard ? Math.abs(balance) : balance).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
          {isCreditCard && (
            <GetFlagLogo 
              bandeira={account.bandeira} 
              className="w-12 h-12" 
            />
          )}
        </div>
      </div>
    </div>
  );
}