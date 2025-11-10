import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await resetPassword(email);
      setMsg("Enviamos um link para redefinir sua senha.");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-md w-full max-w-sm p-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">FinanSmart</h1>
        <p className="text-sm text-gray-500 mb-6">Recuperar Senha</p>

        <form onSubmit={handleReset} className="flex flex-col gap-4 text-left">
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {msg && <p className="text-center text-sm text-blue-600">{msg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md transition"
          >
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>

        <Link to="/login" className="text-sm text-blue-600 hover:underline block mt-4">
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
