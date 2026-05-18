import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function BingoCell({
  value,
  isCrossed,
  isCurrent,
  isPickable,
  onClick,
}: {
  value: number;
  isCrossed: boolean;
  isCurrent: boolean;
  isPickable: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={isPickable ? { y: -2 } : undefined}
      onClick={onClick}
      disabled={!isPickable}
      className={cn(
        "aspect-square rounded-xl text-base font-bold transition sm:text-lg",
        isCrossed
          ? "bg-[#ec4899] text-white shadow-[0_6px_16px_rgba(236,72,153,0.4)]"
          : isPickable
            ? "cursor-pointer border-2 border-pink-100 bg-white text-stone-800 shadow-sm hover:border-pink-300 hover:shadow-md"
            : "cursor-not-allowed border-2 border-pink-50 bg-white text-stone-700 shadow-sm",
        isCurrent && "ring-2 ring-yellow-400 ring-offset-2",
      )}
    >
      {value}
    </motion.button>
  );
}
