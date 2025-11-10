import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useMonth } from "../context/MonthContext";
import FloatingActionButton from "../components/FloatingActionButton";
import TransactionModal from "../components/TransactionModal"; // Modal global
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  CreditCard,
  Wallet,
  Tag,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 🌍 AppLayout — Layout global do FinanSmart
 * 
 * Inclui:
 * - Header fixo
 * - Menu mobile animado
 * - FAB dinâmico arrastável
 * - TransactionModal global
 */

export default function AppLayout() {
  const { monthName, changeMonth } = useMonth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const routes = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/transactions", label: "Transações", icon: Wallet },
    { path: "/accounts", label: "Contas", icon: CreditCard },
    { path: "/categories", label: "Categorias", icon: Tag },
    { path: "/settings", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/90 to-green-50/90 flex flex-col">
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-lg border-b border-white/30 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-5 py-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-800 tracking-tight">
              Finan<span className="text-blue-600">Smart</span>
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 capitalize min-w-[130px] text-center select-none">
              {monthName}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-4">
            {routes.map((r) => {
              const Icon = r.icon;
              const isActive =
                location.pathname === r.path ||
                (r.path !== "/" && location.pathname.startsWith(r.path));
              return (
                <Link
                  key={r.path}
                  to={r.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {r.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-700"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* ===== MENU MOBILE ===== */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-white/90 backdrop-blur-lg border-t border-gray-200 shadow-inner"
            >
              <div className="flex flex-col items-start p-4 space-y-3">
                {routes.map((r) => {
                  const Icon = r.icon;
                  const isActive =
                    location.pathname === r.path ||
                    (r.path !== "/" && location.pathname.startsWith(r.path));

                  return (
                    <Link
                      key={r.path}
                      to={r.path}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {r.label}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ===== CONTEÚDO PRINCIPAL ===== */}
      <main className="flex-1 pt-20 pb-10 px-4 flex justify-center">
        <div className="w-full max-w-5xl">
          <Outlet />
        </div>
      </main>

      {/* ===== FAB GLOBAL ===== */}
      <FloatingActionButton onClick={() => setModalOpen(true)} />

      {/* ===== MODAL GLOBAL ===== */}
      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType="despesa"
      />
    </div>
  );
}
