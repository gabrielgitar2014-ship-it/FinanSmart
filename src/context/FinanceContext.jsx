import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext'; // Depende do AuthContext

// 1. Criar o Contexto
const FinanceContext = createContext(null);

// 2. Criar o Provedor
export function FinanceProvider({ children }) {
  const { user, session } = useAuth(); // Pega o usuário logado
  
  // Estado principal
  const [loading, setLoading] = useState(true);
  const [household, setHousehold] = useState(null); // O "Lar" atual
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Função para buscar TODOS os dados financeiros de uma vez
  const fetchAllFinancialData = useCallback(async (currentUser) => {
    if (!currentUser) return;

    setLoading(true);
    
    try {
      // 1. Descobrir qual é o household do usuário
      const { data: memberData, error: memberError } = await supabase
        .from('household_members')
        .select('household_id, households(*)') // Pega o ID e os detalhes do Lar
        .eq('user_id', currentUser.id)
        .single(); // Supõe que o usuário está em UM lar no MVP

      if (memberError || !memberData) throw new Error(memberError?.message || "Usuário não está em um 'lar'.");

      const currentHousehold = memberData.households;
      const currentHouseholdId = memberData.household_id;
      setHousehold(currentHousehold);

      // 2. Buscar todos os dados daquele Lar EM PARALELO
      const [accountsData, categoriesData, transactionsData] = await Promise.all([
        supabase.from('accounts').select('*').eq('household_id', currentHouseholdId),
        supabase.from('categories').select('*').eq('household_id', currentHouseholdId),
        supabase.from('transactions').select('*').eq('household_id', currentHouseholdId).order('data', { ascending: false })
      ]);

      if (accountsData.error) throw new Error(accountsData.error.message);
      if (categoriesData.error) throw new Error(categoriesData.error.message);
      if (transactionsData.error) throw new Error(transactionsData.error.message);

      // 3. Setar o estado
      setAccounts(accountsData.data);
      setCategories(categoriesData.data);
      setTransactions(transactionsData.data);

    } catch (error) {
      console.error("Erro ao buscar dados financeiros:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito que dispara a busca quando o usuário loga
  useEffect(() => {
    if (session && user) {
      fetchAllFinancialData(user);
    } else {
      // Se deslogar, limpa tudo
      setLoading(false);
      setHousehold(null);
      setAccounts([]);
      setCategories([]);
      setTransactions([]);
    }
  }, [session, user, fetchAllFinancialData]);

  // Função para adicionar uma nova transação
  const addTransaction = async (txData) => {
    if (!household || !user) return; // Segurança

    try {
      const { data: newTransaction, error } = await supabase
        .from('transactions')
        .insert({
          ...txData, // ex: { descricao, valor, account_id, category_id, data }
          household_id: household.id, // Amarra ao Lar
          user_id: user.id // Amarra a quem criou
        })
        .select()
        .single();

      if (error) throw error;

      // Atualiza o estado local imediatamente
      setTransactions([newTransaction, ...transactions]);
      return newTransaction;
    } catch (error) {
      console.error("Erro ao adicionar transação:", error.message);
      throw error; // Lança o erro para o formulário saber
    }
  };

  // Função para adicionar uma nova conta
  const addAccount = async (accountData) => {
    if (!household) throw new Error("Nenhum 'lar' (household) selecionado.");

    try {
      const { data: newAccount, error } = await supabase
        .from('accounts')
        .insert({
          ...accountData, // { nome_conta, tipo, bandeira, close_day, etc... }
          household_id: household.id, // Amarra ao Lar
        })
        .select()
        .single();

      if (error) throw error;

      // Atualiza o estado local
      setAccounts([...accounts, newAccount]);
      return newAccount;

    } catch (error) {
      console.error("Erro ao adicionar conta:", error.message);
      throw error; // Lança o erro para o formulário saber
    }
  };

  // 4. Prover o valor para os componentes filhos
  const value = {
    loading,
    household,
    accounts,
    categories,
    transactions,
    addTransaction,
    addAccount, // Adiciona a nova função ao contexto
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

// 5. Criar o Hook customizado
export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
  }
  return context;
}