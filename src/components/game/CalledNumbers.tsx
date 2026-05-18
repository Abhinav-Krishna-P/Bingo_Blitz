import { DEFAULT_BOARD_SIZE, maxNumberFor } from "@/utils/bingo";

const MAX_NUMBER = maxNumberFor(DEFAULT_BOARD_SIZE);

export function CalledNumbers({
  calledNumbers,
  currentNumber,
}: {
  calledNumbers: number[];
  currentNumber: number | null;
}) {
  const called = new Set(calledNumbers);

  return (
    <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-[0_8px_24px_rgba(236,72,153,0.08)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ec4899]">Signal Feed</p>
          <h3 className="mt-1 text-xl font-bold text-stone-800">Called Numbers</h3>
        </div>
        <div className="text-sm font-semibold text-[#ec4899]">
          {calledNumbers.length} / {MAX_NUMBER}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-5 gap-3 sm:grid-cols-10">
        {Array.from({ length: MAX_NUMBER }, (_, index) => index + 1).map((value) => {
          const isCalled = called.has(value);
          const isCurrent = currentNumber === value;
          return (
            <span
              key={value}
              className={`flex aspect-square items-center justify-center rounded-full text-sm font-bold transition ${
                isCurrent
                  ? "bg-[#ec4899] text-white ring-2 ring-yellow-400 ring-offset-2"
                  : isCalled
                    ? "bg-[#ec4899] text-white shadow-[0_3px_8px_rgba(236,72,153,0.35)]"
                    : "bg-stone-100 text-stone-500"
              }`}
            >
              {value}
            </span>
          );
        })}
      </div>
    </div>
  );
}
