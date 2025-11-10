import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // Importa o cliente
import { Mail, ArrowLeft } from 'lucide-react'; // Ícones
import { motion } from 'framer-motion'; // Animação
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 1. URL de redirecionamento
      // Esta é a URL da SUA aplicação para onde o usuário será enviado 
      // DEPOIS de clicar no link do e-mail.
      // Deve ser a página que vamos criar para ATUALIZAR a senha.
      const redirectTo = `${window.location.origin}/update-password`;

      // 2. Chamada do Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });

      if (error) throw error;

      // 3. Sucesso
      setSuccessMessage("Link de recuperação enviado! Verifique seu e-mail (inclusive a caixa de spam).");
      setEmail(''); // Limpa o campo

    } catch (error) {
      setError(error.message || "Ocorreu um erro ao solicitar a recuperação.");
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
            Recuperar Senha
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Insira seu e-mail e enviaremos um link para você redefinir sua senha.
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

        <form className="space-y-6" onSubmit={handlePasswordReset}>
          {/* Campo de Email */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full py-3 pl-10 pr-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Botão de Enviar */}
          <div>
            <button
              type="submit"
              disabled={loading || !!successMessage} // Desabilita após o sucesso também
              className={`w-full flex justify-center py-3 px-4 border border-transparent
               rounded-md shadow-sm text-sm font-medium text-white 
               bg-indigo-600 hover:bg-indigo-700 
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
               ${loading || !!successMessage ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
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
            Voltar para o Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}