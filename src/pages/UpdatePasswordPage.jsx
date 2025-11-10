import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // Importa o cliente
import { Lock, ArrowLeft } from 'lucide-react'; // Ícones
import { motion } from 'framer-motion'; // Animação
import { Link, useNavigate } from 'react-router-dom';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // 1. Validação de senha
    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      // 2. Chamada do Supabase
      // O Supabase client já leu o token da URL (o #hash)
      // e o usará para esta chamada.
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      // 3. Sucesso
      setSuccessMessage("Senha atualizada com sucesso! Você será redirecionado para o login.");
      
      // Limpa os campos
      setPassword('');
      setConfirmPassword('');

      // Redireciona o usuário para o login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      setError(error.message || "Ocorreu um erro ao atualizar a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <motion.div
        className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Defina sua nova senha
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Insira a nova senha que deseja usar para acessar sua conta.
          </p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
            {error}
          </div>
        )}

        {/* Mensagem de Sucesso */}
        {successMessage && (
          <div className="p-3 text-sm text-green-700 bg-green-100 border border-green-300 rounded-md">
            {successMessage}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleUpdatePassword}>
          {/* Campo de Senha */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Nova Senha
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full py-3 pl-10 pr-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          {/* Campo de Confirmar Senha */}
          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-gray-700"
            >
              Confirmar Nova Senha
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita sua nova senha"
                className="w-full py-3 pl-10 pr-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Botão de Atualizar */}
          <div>
            <button
              type="submit"
              disabled={loading || !!successMessage}
              className={`w-full flex justify-center py-3 px-4 border border-transparent
               rounded-md shadow-sm text-sm font-medium text-white 
               bg-indigo-600 hover:bg-indigo-700 
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
               ${loading || !!successMessage ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Atualizando...' : 'Atualizar Senha e Entrar'}
            </button>
          </div>
        </form>

        {/* Link para Login */}
        <p className="text-sm text-center text-gray-600">
          <Link 
            to="/login" 
            className="inline-flex items-center font-medium text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Lembrou a senha? Voltar para o Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}