import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// --- Contexto base ---
const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [household, setHousehold] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  // --- Carrega dados principais ---
  const fetchFinanceData = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Obtém o household do usuário
      const { data: householdMember } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", userId)
        .single();

      if (!householdMember) throw new Error("Nenhum household encontrado.");

      setHousehold(householdMember.household_id);

      // 2️⃣ Carrega contas
      const { data: acc } = await supabase
        .from("accounts")
        .select("*")
        .eq("household_id", householdMember.household_id)
        .order("nome_conta", { ascending: true });

      setAccounts(acc || []);

      // 3️⃣ Carrega categorias
      const { data: cat } = await supabase
        .from("categories")
        .select("*")
        .eq("household_id", householdMember.household_id)
        .order("nome", { ascending: true });

      setCategories(cat || []);

      // 4️⃣ Carrega transações
      const { data: trans } = await supabase
        .from("transactions")
        .select("*")
        .eq("household_id", householdMember.household_id)
        .order("data", { ascending: false });

      setTransactions(trans || []);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Hook inicial (simulação de login ativo) ---
  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      const user = data?.session?.user;
      if (user?.id) fetchFinanceData(user.id);
      else setLoading(false);
    });

    // Escuta mudanças de autenticação
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (user?.id) fetchFinanceData(user.id);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const value = {
    loading,
    error,
    household,
    accounts,
    categories,
    transactions,
    refresh: () => {
      const user = supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.id) fetchFinanceData(data.user.id);
      });
    },
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

// --- Hook de acesso rápido ---
export const useFinance = () => {
    const ctx = useContext(FinanceContext);
    if (!ctx) throw new Error("useFinance deve ser usado dentro de <FinanceProvider>");
    return ctx;
};
