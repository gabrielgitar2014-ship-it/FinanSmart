import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // Importa o cliente
import { Mail, Lock } from 'lucide-react'; // Ícones
import { motion } from 'framer-motion'; // Animação
// Supondo que você está usando react-router-dom para navegação
import { Link, useNavigate } from 'react-router-dom'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      // Se o login for bem-sucedido, o listener 'onAuthStateChange' 
      // (geralmente no App.js) vai redirecionar, ou podemos fazer manualmente:
      navigate('/dashboard'); // Redireciona para a home/dashboard

    } catch (error) {
      setError(error.message || "Ocorreu um erro no login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <motion.div
        className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-xl"
        // Animação sutil de entrada
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Bem-vindo de volta!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Acesse sua conta para continuar.
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
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

          {/* Campo de Senha */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full py-3 pl-10 pr-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end mt-2 text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Esqueceu sua senha?
              </a>
            </div>
          </div>

          {/* Botão de Login */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent
               rounded-md shadow-sm text-sm font-medium text-white 
               bg-indigo-600 hover:bg-indigo-700 
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
               ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        {/* Link para Registro */}
        <p className="text-sm text-center text-gray-600">
          Não tem uma conta?{' '}
          <Link 
            to="/register" 
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Cadastre-se
          </Link>
        </p>
      </motion.div>
    </div>
  );
}