export function GameTimer({
  secondsLeft,
  totalSeconds,
  isMyTurn,
}: {
  secondsLeft: number;
  totalSeconds: number;
  isMyTurn: boolean;
}) {
  const ratio = totalSeconds > 0 ? Math.min(1, Math.max(0, secondsLeft / totalSeconds)) : 0;
  const circumference = 2 * Math.PI * 22;
  const offset = circumference * (1 - ratio);

  return (
    <div className="rounded-3xl border border-pink-100 bg-white p-5 shadow-[0_8px_24px_rgba(236,72,153,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ec4899]">Timer</p>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="22" fill="none" stroke="#fce7e9" strokeWidth="4" />
            <circle
              cx="26"
              cy="26"
              r="22"
              fill="none"
              stroke="#ec4899"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-200 ease-linear"
            />
          </svg>
          <span className="text-lg font-bold text-stone-800">{secondsLeft}</span>
        </div>
        <p className="flex-1 text-sm leading-snug text-stone-600">
          {isMyTurn
            ? "Pick before the timer runs out or a number is chosen for you."
            : "Countdown until the active player's pick is auto-selected."}
        </p>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-pink-50">
        <div
          className="h-full rounded-full bg-[#ec4899] transition-[width] duration-200 ease-linear"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
