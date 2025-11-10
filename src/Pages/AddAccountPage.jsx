import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import AccountCardVisual from '../components/AccountCardVisual';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. Nossas Definições de Template ---
// Adicionamos 'group' para o <optgroup> do seletor
const ACCOUNT_TEMPLATES = [
  // Cartões de Crédito
  { id: 'nubank', issuer_id: 'Nubank', bandeira: 'Mastercard', cor_personalizada: '#820ad1', tipo: 'Credit Card', group: 'Cartões de Crédito' },
  { id: 'inter', issuer_id: 'Inter', bandeira: 'Mastercard', cor_personalizada: '#ff7a00', tipo: 'Credit Card', group: 'Cartões de Crédito' },
  { id: 'itau_click', issuer_id: 'Itaú Unibanco', bandeira: 'Visa', cor_personalizada: '#007ab7', tipo: 'Credit Card', group: 'Cartões de Crédito' },
  { id: 'bradesco_elo', issuer_id: 'Bradesco', bandeira: 'Elo', cor_personalizada: '#c81927', tipo: 'Credit Card', group: 'Cartões de Crédito' },
  // Outras Contas
  { id: 'checking', nome_conta: 'Conta Corrente', cor_personalizada: '#374151', tipo: 'Checking', group: 'Outras Contas' },
  { id: 'cash', nome_conta: 'Dinheiro', cor_personalizada: '#16a34a', tipo: 'Cash', group: 'Outras Contas' },
  // Personalizado
  { id: 'custom_card', nome_conta: 'Cartão Personalizado', cor_personalizada: '#6366F1', tipo: 'Credit Card', isCustom: true, group: 'Personalizado' },
  { id: 'custom_account', nome_conta: 'Outra Conta', cor_personalizada: '#6B7280', tipo: 'Checking', isCustom: true, group: 'Personalizado' },
];

// Helper para agrupar o seletor
const groupedTemplates = {
  "Cartões de Crédito": ACCOUNT_TEMPLATES.filter(t => t.group === 'Cartões de Crédito'),
  "Outras Contas": ACCOUNT_TEMPLATES.filter(t => t.group === 'Outras Contas'),
  "Personalizado": ACCOUNT_TEMPLATES.filter(t => t.group === 'Personalizado'),
};
// --- Fim das Definições ---


export default function AddAccountPage() {
  const { addAccount } = useFinance();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Campos do formulário
  const [nomeConta, setNomeConta] = useState('');
  const [last4Digits, setLast4Digits] = useState('');
  const [closeDay, setCloseDay] = useState(1);
  const [customIssuer, setCustomIssuer] = useState('');
  const [customFlag, setCustomFlag] = useState('');
  const [customColor, setCustomColor] = useState('#6366F1');

  // 2. Encontra o template com base no ID selecionado
  const currentTemplate = useMemo(() => {
    if (!selectedTemplateId) return null;
    return ACCOUNT_TEMPLATES.find(t => t.id === selectedTemplateId);
  }, [selectedTemplateId]);

  // 3. Pré-preenche o nome da conta se não for customizado
  useEffect(() => {
    if (currentTemplate && !currentTemplate.isCustom) {
      setNomeConta(currentTemplate.nome_conta || currentTemplate.issuer_id);
    } else {
      setNomeConta(''); // Reseta se for customizado
    }
  }, [currentTemplate]);

  // 4. Cria a "prévia" do cartão misturando template e dados do form
  const previewAccount = useMemo(() => {
    if (!currentTemplate) return null;
    
    return {
      ...currentTemplate,
      nome_conta: nomeConta || (currentTemplate.isCustom ? 'Minha Conta' : (currentTemplate.nome_conta || currentTemplate.issuer_id)),
      ultimos_4_digitos: last4Digits,
      cor_personalizada: currentTemplate.isCustom ? customColor : currentTemplate.cor_personalizada,
      bandeira: currentTemplate.isCustom ? customFlag : currentTemplate.bandeira,
    };
  }, [currentTemplate, nomeConta, last4Digits, customColor, customFlag]);

  // 5. Lógica de Submit (idêntica à anterior)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isCustom = currentTemplate.isCustom;
    const isCreditCard = currentTemplate.tipo === 'Credit Card';

    const accountData = {
      nome_conta: nomeConta,
      ultimos_4_digitos: isCreditCard ? last4Digits : null,
      close_day: isCreditCard ? Number(closeDay) : null,
      tipo: currentTemplate.tipo,
      issuer_id: isCustom ? customIssuer : currentTemplate.issuer_id,
      bandeira: isCustom ? customFlag : currentTemplate.bandeira,
      cor_personalizada: isCustom ? customColor : currentTemplate.cor_personalizada,
    };

    try {
      await addAccount(accountData);
      navigate('/accounts'); // Sucesso!
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  
  // -- Container Principal da Página --
  return (
    <div className="flex justify-center items-start w-full min-h-full p-4 md:p-8 overflow-y-auto">
      <div 
        className="w-full max-w-lg 
                   bg-white/50 backdrop-blur-lg 
                   border border-white/20 
                   rounded-3xl shadow-xl p-6"
      >
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Adicionar Conta</h1>
          <button onClick={() => navigate(-1)} className="text-sm text-indigo-600">Cancelar</button>
        </header>

        {/* --- ETAPA 1: O SELETOR --- */}
        <div className="p-6 bg-white rounded-xl shadow-lg mb-6">
          <label htmlFor="account-select" className="block text-sm font-medium text-gray-700 mb-2">
            1. Escolha o tipo de conta
          </label>
          <select 
            id="account-select"
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md bg-white focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="" disabled>Selecione...</option>
            {Object.entries(groupedTemplates).map(([groupName, templates]) => (
              <optgroup label={groupName} key={groupName}>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nome_conta || t.issuer_id}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* --- ETAPA 2: O FORMULÁRIO (CONDICIONAL) --- */}
        <AnimatePresence>
          {currentTemplate && (
            <motion.form 
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-900">2. Configure os detalhes</h2>
              
              {/* A Prévia do Cartão */}
              <div className="mb-6">
                <AccountCardVisual account={previewAccount} />
              </div>

              {/* Os Inputs */}
              <div className="p-6 bg-white rounded-2xl shadow-lg space-y-4">
                <input
                  type="text"
                  value={nomeConta}
                  onChange={(e) => setNomeConta(e.target.value)}
                  placeholder="Apelido da Conta"
                  required
                  className="w-full text-lg p-3 border border-gray-300 rounded-md"
                />

                {/* Campos 100% Personalizados */}
                {currentTemplate.isCustom && (
                  <>
                    <input type="text" value={customIssuer} onChange={(e) => setCustomIssuer(e.target.value)} placeholder="Emissor (Ex: Nubank)" required className="w-full p-3 border border-gray-300 rounded-md"/>
                    <input type="text" value={customFlag} onChange={(e) => setCustomFlag(e.target.value)} placeholder="Bandeira (Ex: Visa)" required className="w-full p-3 border border-gray-300 rounded-md"/>
                    <div className="flex items-center space-x-2 p-3">
                      <label htmlFor="color" className="text-gray-600">Cor:</label>
                      <input id="color" type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="w-10 h-10 border-none"/>
                    </div>
                  </>
                )}

                {/* Campos Específicos de Cartão de Crédito */}
                {currentTemplate.tipo === 'Credit Card' && (
                  <>
                    <input
                      type="number"
                      value={last4Digits}
                      onChange={(e) => setLast4Digits(e.target.value.slice(0, 4))}
                      placeholder="Últimos 4 dígitos (Opcional)"
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                    <div className="flex items-center space-x-2 p-3">
                      <label htmlFor="close_day" className="text-gray-600">Dia do Fechamento:</label>
                      <input
                        id="close_day"
                        type="number"
                        value={closeDay}
                        onChange={(e) => setCloseDay(e.target.value)}
                        min="1" max="31" required
                        className="w-20 p-3 border border-gray-300 rounded-md"
                      />
                    </div>
                  </>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full p-4 rounded-xl text-white font-bold text-lg
                            ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Salvar Conta'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}