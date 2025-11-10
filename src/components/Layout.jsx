import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './SideBar';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion'; 
import { useRef } from 'react'; // Mantenha o useRef

export default function Layout() {
  const navigate = useNavigate();
  const constraintsRef = useRef(null);
  
  // ==================================================
  // CORREÇÃO APLICADA AQUI
  // 1. Criamos uma 'ref' para rastrear o estado de "arraste"
  // ==================================================
  const isDraggingRef = useRef(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200">
      <Sidebar />
      
      <main 
        ref={constraintsRef} 
        className="flex-1 relative overflow-hidden"
      >
        <Outlet />

        <motion.button
          // Lógica de Drag
          drag={true}
          dragConstraints={constraintsRef}
          dragMomentum={false}
          dragElastic={0.1}
          
          // 2. Quando o "arraste" COMEÇAR, ativamos a "trava"
          onDragStart={() => {
            isDraggingRef.current = true;
          }}

          // 3. O 'onTap' SÓ navega se a "trava" estiver DESATIVADA
          onTap={() => {
            if (!isDraggingRef.current) {
              navigate('/new-transaction');
            }
          }}
          
          // 4. Quando o "arraste" TERMINAR, desativamos a "trava"
          // Usamos requestAnimationFrame para garantir que isso
          // rode DEPOIS do 'onTap' ter tido a chance de verificar.
          onDragEnd={() => {
            requestAnimationFrame(() => {
              isDraggingRef.current = false;
            });
          }}

          // Feedbacks visuais
          whileHover={{ scale: 1.05, cursor: 'grab' }}
          whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
          
          className="absolute bottom-8 right-8 
                     w-12 h-12 bg-indigo-600 text-white 
                     rounded-full shadow-lg 
                     flex items-center justify-center
                     z-30"
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      </main>
    </div>
  );

}
