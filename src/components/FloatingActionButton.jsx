import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

/**
 * 🪄 FloatingActionButton (FAB)
 *
 * - Arrastável com framer-motion
 * - Posição persistente (localStorage)
 * - Aciona função global (Nova Transação)
 */

export default function FloatingActionButton({ onClick }) {
  const constraintsRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Carrega posição salva
  useEffect(() => {
    const saved = localStorage.getItem("finansmart_fab_position");
    if (saved) {
      const { x, y } = JSON.parse(saved);
      setPosition({ x, y });
    } else {
      // Posição padrão: canto inferior direito
      setPosition({ x: -24, y: -120 });
    }
  }, []);

  // Salva posição sempre que o botão é solto
  const handleDragEnd = (event, info) => {
    const { x, y } = info.point;
    localStorage.setItem(
      "finansmart_fab_position",
      JSON.stringify({ x: info.offset.x, y: info.offset.y })
    );
    setIsDragging(false);
  };

  return (
    <div
      ref={constraintsRef}
      className="fixed inset-0 pointer-events-none z-[60]"
    >
      <motion.button
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.12}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        initial={position}
        animate={position}
        onClick={(e) => {
          if (!isDragging) onClick(e);
        }}
        className={`pointer-events-auto fixed bottom-20 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
          isDragging ? "cursor-grabbing opacity-70" : "cursor-grab"
        } bg-blue-600 hover:bg-blue-700 active:scale-95`}
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
}
