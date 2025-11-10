import { motion } from "framer-motion";
import { User, Moon, LogOut } from "lucide-react";

export default function Settings() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex justify-center items-start py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-lg p-6 space-y-6"
      >
        <h1 className="text-xl font-semibold text-center">Configurações</h1>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="w-full flex items-center justify-between bg-gray-50 p-4 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-blue-500" />
              <span>Perfil</span>
            </div>
            <span className="text-gray-400 text-sm">Editar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            className="w-full flex items-center justify-between bg-gray-50 p-4 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-purple-500" />
              <span>Tema Escuro</span>
            </div>
            <span className="text-gray-400 text-sm">Em breve</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            className="w-full flex items-center justify-between bg-red-50 p-4 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-500" />
              <span>Sair</span>
            </div>
            <span className="text-gray-400 text-sm">Logout</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
