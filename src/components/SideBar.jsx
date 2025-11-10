import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  Tags, 
  Settings, 
  LogOut, 
  ChevronLeft 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

// Animação do texto (escopo do módulo)
const textVariants = {
  closed: { opacity: 0, x: -20, display: 'none', transition: { duration: 0.1 } },
  open: { opacity: 1, x: 0, display: 'inline-block', transition: { delay: 0.15, duration: 0.3 } }
};

// Componente NavItem
const NavItem = ({ icon: Icon, text, to, isOpen }) => {
  return (
    <Link
      to={to}
      className="flex items-center p-3 rounded-lg text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
    >
      <Icon className="w-6 h-6 flex-shrink-0" />
      <motion.span
        className="ml-4 font-medium whitespace-nowrap"
        variants={textVariants}
        animate={isOpen ? 'open' : 'closed'}
      >
        {text}
      </motion.span>
    </Link>
  );
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  // Animação da Sidebar
  const sidebarVariants = {
    open: {
      width: '16rem', // w-64
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    closed: {
      width: '4rem', // w-16
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/login');
    } else {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    // ======================================================
    // MUDANÇAS DE ESTILO APLICADAS AQUI
    // 1. Trocado 'bg-gray-900' por 'bg-black/50 backdrop-blur-lg'
    // 2. Adicionado 'border-r border-white/10'
    // 3. Adicionado 'relative' para posicionar o botão
    // ======================================================
    <motion.nav
      className="relative h-screen bg-black/50 backdrop-blur-lg border-r border-white/10 text-white flex flex-col p-4 shadow-xl overflow-hidden"
      variants={sidebarVariants}
      animate={isOpen ? 'open' : 'closed'}
    >
      {/* ======================================================
      // BOTÃO CORRIGIDO AQUI
      // 1. Trocado '-right-3' por 'right-4'
      // 2. Ajustado 'top-4'
      // ====================================================== */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 right-4 p-1.5 bg-indigo-600 text-white rounded-full focus:outline-none z-10"
      >
        <motion.div
          animate={{ rotate: isOpen ? 0 : 180 }}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.div>
      </button>

      {/* Logo/Título */}
      <div className="flex items-center mb-10" style={{ minHeight: '3rem' }}>
        <motion.h1 
          className="text-2xl font-bold whitespace-nowrap"
          variants={textVariants}
          animate={isOpen ? 'open' : 'closed'}
        >
          FinanSmart
        </motion.h1>
      </div>

      {/* Itens de Navegação */}
      <div className="flex-1 flex flex-col space-y-2">
        <NavItem to="/dashboard" icon={LayoutDashboard} text="Dashboard" isOpen={isOpen} />
        <NavItem to="/transactions" icon={ArrowLeftRight} text="Transações" isOpen={isOpen} />
        <NavItem to="/accounts" icon={Wallet} text="Contas" isOpen={isOpen} />
        <NavItem to="/categories" icon={Tags} text="Categorias" isOpen={isOpen} />
      </div>

      {/* Rodapé da Sidebar (Configurações, Sair) */}
      <div className="flex flex-col space-y-2">
        <NavItem to="/settings" icon={Settings} text="Configurações" isOpen={isOpen} />
        <div 
          onClick={handleLogout}
          className="flex items-center p-3 rounded-lg text-gray-200 hover:bg-red-600/50 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-6 h-6 flex-shrink-0" />
          <motion.span
            className="ml-4 font-medium whitespace-nowrap"
            variants={textVariants}
            animate={isOpen ? 'open' : 'closed'}
          >
            Sair
          </motion.span>
        </div>
      </div>
    </motion.nav>
  );
}