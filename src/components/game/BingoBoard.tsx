import type { BingoCard } from "@/types/game";
import { BingoCell } from "@/components/game/BingoCell";
import { BINGO_LETTERS, lettersEarned } from "@/utils/bingo";

export function BingoBoard({
  card,
  calledNumbers,
  currentNumber,
  isMyTurn,
  onPick,
}: {
  card: BingoCard;
  calledNumbers: number[];
  currentNumber: number | null;
  isMyTurn: boolean;
  onPick: (row: number, col: number) => void;
}) {
  const crossed = new Set(calledNumbers);
  const earned = lettersEarned(card, calledNumbers);
  const size = card.length;
  const gridStyle = { gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` };

  return (
    <section className="mx-auto w-full max-w-md rounded-3xl border border-pink-100 bg-white p-4 shadow-[0_8px_24px_rgba(236,72,153,0.08)] sm:p-5">
      <div className="mb-3 grid grid-cols-5 gap-1.5">
        {BINGO_LETTERS.map((letter, index) => {
          const isEarned = index < earned;
          return (
            <div
              key={letter}
              className={`rounded-full py-1.5 text-center text-base font-bold tracking-wider transition ${
                isEarned
                  ? "bg-[#ec4899] text-white shadow-[0_3px_10px_rgba(236,72,153,0.5)] ring-2 ring-yellow-300/60"
                  : "bg-[#ec4899] text-white shadow-[0_3px_8px_rgba(236,72,153,0.3)]"
              }`}
            >
              <span className={isEarned ? "line-through decoration-white/90 decoration-[3px]" : undefined}>
                {letter}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className={`mb-3 rounded-xl px-3 py-2 text-center text-xs font-medium transition ${
          isMyTurn
            ? "bg-pink-50 text-[#ec4899]"
            : "bg-stone-50 text-stone-500"
        }`}
      >
        {isMyTurn
          ? "Your turn — pick a number from your board."
          : "Waiting for the active player to pick a number."}
      </div>

      <div className="grid gap-1.5" style={gridStyle}>
        {card.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const isCrossed = crossed.has(value);
            return (
              <BingoCell
                key={`${rowIndex}-${colIndex}`}
                value={value}
                isCrossed={isCrossed}
                isCurrent={currentNumber === value}
                isPickable={isMyTurn && !isCrossed}
                onClick={() => onPick(rowIndex, colIndex)}
              />
            );
          }),
        )}
      </div>
    </section>
  );
}
