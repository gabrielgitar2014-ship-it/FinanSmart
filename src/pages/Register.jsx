import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // ✅ Adicionado useLocation
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Hook para ler a URL
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirm, setConfirm] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. LÊ O TOKEN DA URL (?invite_token=...)
  const query = new URLSearchParams(location.search);
  const inviteToken = query.get('invite_token');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (senha !== confirm) return setErro("As senhas não coincidem.");
    try {
      setLoading(true);
      await signUp(email, senha, nome);
      
      // 2. REDIRECIONAMENTO CONDICIONAL
      if (inviteToken) {
        // Se houver um token, redireciona para aceitar o convite.
        // O AcceptInvite.jsx fará a lógica de aceitação, agora com o usuário logado.
        navigate(`/invite/${inviteToken}`);
      } else {
        // Caso contrário, redireciona para a tela de login normal.
        navigate("/login");
      }
      
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-md w-full max-w-sm p-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">FinanSmart</h1>
        <p className="text-sm text-gray-500 mb-6">Crie sua conta</p>
        
        {/* Adiciona uma mensagem para o convidado */}
        {inviteToken && (
          <p className="text-sm text-blue-600 mb-4 font-medium">
            Você está se cadastrando para aceitar um convite!
          </p>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4 text-left">
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md transition"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}