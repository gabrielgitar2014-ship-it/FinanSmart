import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Wifi } from "lucide-react";

// Lista de emissores e bandeiras no Brasil
const BANK_CARDS = [
  { issuer: "Nubank", bandeira: "Mastercard", color: "#8A05BE" },
  { issuer: "Itaú", bandeira: "Visa", color: "#EC7000" },
  { issuer: "Bradesco", bandeira: "Visa", color: "#CC0000" },
  { issuer: "Banco do Brasil", bandeira: "Visa", color: "#FFCC00" },
  { issuer: "Santander", bandeira: "Mastercard", color: "#E30613" },
  { issuer: "Caixa", bandeira: "Elo", color: "#005CA9" },
  { issuer: "Inter", bandeira: "Mastercard", color: "#FF7A00" },
  { issuer: "BTG Pactual", bandeira: "Visa", color: "#002776" },
  { issuer: "Neon", bandeira: "Visa", color: "#00FFFF" },
  { issuer: "C6 Bank", bandeira: "Mastercard", color: "#121212" },
  { issuer: "PagBank", bandeira: "Visa", color: "#009739" },
  { issuer: "PicPay", bandeira: "Mastercard", color: "#00C04B" },
  { issuer: "Banco Original", bandeira: "Mastercard", color: "#00A859" },
  { issuer: "Safra", bandeira: "Visa", color: "#1C2957" },
  { issuer: "Banrisul", bandeira: "Visa", color: "#0072CE" },
  { issuer: "Mercado Pago", bandeira: "Visa", color: "#009EE3" },
  { issuer: "Porto Seguro", bandeira: "Visa", color: "#0092D0" },
  { issuer: "Sicoob", bandeira: "Elo", color: "#00783E" },
  { issuer: "XP", bandeira: "Mastercard", color: "#000000" },
  { issuer: "Digio", bandeira: "Visa", color: "#1A1F71" },
];

export default function WalletCardSelector({ selectedCard, onSelect }) {
  const [active, setActive] = useState(selectedCard || null);

  useEffect(() => {
    if (selectedCard) setActive(selectedCard);
  }, [selectedCard]);

  const handlePersonalizar = () => {
    setActive(null);
    if (onSelect) onSelect(null);
  };

  return (
    <div className="relative w-full py-4 overflow-x-auto hide-scrollbar">
      <div className="flex items-end gap-5 pl-2 sm:pl-6">
        {BANK_CARDS.map((card, idx) => {
          const isActive = active?.issuer === card.issuer;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, type: "spring", stiffness: 80 }}
              whileHover={{ y: -6, scale: 1.04 }}
              onClick={() => {
                setActive(card);
                onSelect?.(card);
              }}
              className={`relative cursor-pointer flex-shrink-0 rounded-xl shadow-md transition-all duration-300 ${
                isActive ? "ring-2 ring-blue-500 ring-offset-2" : ""
              }`}
              style={{
                background: `linear-gradient(135deg, ${card.color} 0%, ${shade(
                  card.color,
                  -25
                )} 100%)`,
                width: "155px",
                height: "95px",
                transform: `translateY(${idx * 1.5}px)`,
                zIndex: isActive ? 10 : BANK_CARDS.length - idx,
              }}
            >
              <div className="flex flex-col justify-between h-full p-3 text-white">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm truncate">
                    {card.issuer}
                  </span>
                  <Wifi className="w-4 h-4 opacity-70" />
                </div>
                <div className="text-xs tracking-widest opacity-80">
                  •••• •••• •••• 1234
                </div>
                <div className="text-right text-[10px] uppercase opacity-90 font-semibold">
                  {card.bandeira}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Botão para personalizar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={handlePersonalizar}
          className="flex-shrink-0 w-[150px] h-[95px] rounded-xl border-2 border-dashed border-gray-400 flex items-center justify-center text-sm text-gray-600 bg-white/70 hover:bg-white/90 font-medium cursor-pointer shadow-sm"
        >
          + Personalizar
        </motion.div>
      </div>
    </div>
  );
}

/* Escurece cor */
function shade(hex, percent) {
  const _hex = hex.replace("#", "");
  const num = parseInt(_hex, 16);
  const r = (num >> 16) + percent;
  const g = ((num >> 8) & 0x00ff) + percent;
  const b = (num & 0x0000ff) + percent;
  const clamp = (v) => Math.max(0, Math.min(255, v));
  return (
    "#" +
    clamp(r).toString(16).padStart(2, "0") +
    clamp(g).toString(16).padStart(2, "0") +
    clamp(b).toString(16).padStart(2, "0")
  );
}
