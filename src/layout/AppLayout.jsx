import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Wallet,
  List,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { useMonth } from "../context/MonthContext";
import { useAuth } from "../context/AuthContext";
import { useTransactionModal } from "../context/TransactionModalContext";
import TransactionModal from "../components/TransactionModal";

export default function AppLayout() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { selectedMonth, changeMonth } = useMonth();
  const { isOpen, openModal, closeModal } = useTransactionModal();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const formatMonth = (date) =>
    date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const menuItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/transactions", label: "Transações", icon: List },
    { to: "/accounts", label: "Contas", icon: Wallet },
    { to: "/categories", label: "Categorias", icon: List },
    { to: "/members", label: "Membros", icon: Users },
    { to: "/settings", label: "Configurações", icon: Settings },
  ];

  // --- FAB magnético com spring ---
  const x = useMotionValue(
    parseFloat(localStorage.getItem("fabX")) || window.innerWidth - 100
  );
  const y = useMotionValue(
    parseFloat(localStorage.getItem("fabY")) || window.innerHeight - 100
  );

  const springX = useSpring(x, { stiffness: 400, damping: 30 });
  const springY = useSpring(y, { stiffness: 400, damping: 30 });

  const handleDock = (info) => {
    const screenWidth = window.innerWidth;
    const targetX = info.point.x > screenWidth / 2 ? screenWidth - 80 : 20; // Dock lateral
    const targetY = Math.max(60, Math.min(info.point.y, window.innerHeight - 100));

    x.set(targetX);
    y.set(targetY);

    localStorage.setItem("fabX", targetX);
    localStorage.setItem("fabY", targetY);
  };

  const [dragLimits, setDragLimits] = useState({
    top: 60,
    left: 10,
    right: window.innerWidth - 80,
    bottom: window.innerHeight - 80,
  });

  useEffect(() => {
    const handleResize = () => {
      setDragLimits({
        top: 60,
        left: 10,
        right: window.innerWidth - 80,
        bottom: window.innerHeight - 80,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-50">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <h1
              onClick={() => navigate("/")}
              className="text-lg font-semibold text-gray-800 tracking-tight cursor-pointer"
            >
              Finan<span className="text-blue-600">Smart</span>
            </h1>
          </div>

          {/* Botões desktop */}
          <nav className="hidden md:flex items-center gap-4">
            {menuItems.map((r) => {
              const Icon = r.icon;
              return (
                <NavLink
                  key={r.to}
                  to={r.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {r.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Controle de mês */}
          <div className="hidden md:flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 capitalize min-w-[130px] text-center select-none">
              {formatMonth(selectedMonth)}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Botão menu mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-700"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Dropdown Mobile */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-inner"
            >
              <div className="flex flex-col items-start p-3 space-y-2">
                {/* Controle de mês no mobile */}
                <div className="flex justify-between items-center w-full mb-3 bg-white/60 px-3 py-1.5 rounded-md border border-gray-200">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="p-1 rounded-md hover:bg-gray-100 text-gray-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {formatMonth(selectedMonth)}
                  </span>
                  <button
                    onClick={() => changeMonth(1)}
                    className="p-1 rounded-md hover:bg-gray-100 text-gray-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {menuItems.map((r) => {
                  const Icon = r.icon;
                  return (
                    <NavLink
                      key={r.to}
                      to={r.to}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      {r.label}
                    </NavLink>
                  );
                })}

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center justify-start gap-2 text-red-600 hover:bg-red-50 py-2 rounded-md transition px-3"
                >
                  <LogOut className="w-4 h-4" /> Sair
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 pt-20 pb-10 px-4 flex justify-center">
        <div className="w-full max-w-6xl">
          <Outlet />
        </div>
      </main>

      {/* FAB magnético com spring + dock + modal */}
      <motion.div
        className="fixed z-50"
        drag
        dragElastic={0.15}
        dragMomentum={false}
        dragConstraints={dragLimits}
        style={{ x: springX, y: springY }}
        onDragEnd={(event, info) => {
          handleDock(info);
          setIsDragging(false);
        }}
        onDragStart={() => setIsDragging(true)}
      >
        <motion.button
          onClick={() => {
            if (!isDragging) openModal(); // agora abre o TransactionModal
          }}
          whileTap={{ scale: 0.9 }}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-xl flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </motion.div>

      {/* Modal de transação global */}
      <TransactionModal open={isOpen} onClose={closeModal} />
    </div>
  );
}
