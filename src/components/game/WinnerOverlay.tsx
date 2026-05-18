import { Crown, Medal, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GameWinner } from "@/types/game";

const PODIUM_META = [
  {
    rank: "1st",
    label: "Champion",
    color: "from-[#fde68a] to-[#d97706]",
    ring: "ring-amber-300",
    Icon: Crown,
    height: "h-44",
  },
  {
    rank: "2nd",
    label: "Runner-up",
    color: "from-[#e5e7eb] to-[#9ca3af]",
    ring: "ring-slate-300",
    Icon: Medal,
    height: "h-36",
  },
  {
    rank: "3rd",
    label: "Bronze",
    color: "from-[#fdba74] to-[#c2410c]",
    ring: "ring-orange-300",
    Icon: Trophy,
    height: "h-28",
  },
] as const;

export function WinnerOverlay({
  winners,
  isHost,
  onPlayAgain,
  onDashboard,
}: {
  winners: GameWinner[];
  isHost: boolean;
  onPlayAgain: () => void;
  onDashboard: () => void;
}) {
  const hasAny = winners.length > 0;
  const display = [winners[0], winners[1], winners[2]] as (GameWinner | undefined)[];
  // Visual ordering: 2nd, 1st, 3rd (so the champion is in the middle)
  const visualOrder: { winner: GameWinner | undefined; meta: (typeof PODIUM_META)[number] }[] = [
    { winner: display[1], meta: PODIUM_META[1] },
    { winner: display[0], meta: PODIUM_META[0] },
    { winner: display[2], meta: PODIUM_META[2] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-[36px] border border-pink-100 bg-white p-8 shadow-2xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.32em] text-[#ec4899]">Game Over</p>
        <h2 className="mt-2 text-center font-bingo text-4xl text-stone-800">
          {hasAny ? "Final Standings" : "No Winner"}
        </h2>
        <p className="mt-2 text-center text-sm text-stone-500">
          {hasAny
            ? "Fastest fingers in the room. Congratulations to the podium."
            : "Nobody buzzed in time. Better luck next round!"}
        </p>

        {hasAny ? (
          <div className="mt-10 flex items-end justify-center gap-4">
            {visualOrder.map(({ winner, meta }) => {
              if (!winner) {
                return (
                  <div
                    key={meta.rank}
                    className={`flex w-1/3 flex-col items-center ${meta.height === "h-44" ? "h-44" : meta.height === "h-36" ? "h-36" : "h-28"}`}
                  >
                    <div className="mt-auto flex w-full flex-1 items-center justify-center rounded-t-2xl border-2 border-dashed border-stone-200 bg-stone-50 text-xs uppercase tracking-[0.22em] text-stone-400">
                      {meta.rank}
                    </div>
                  </div>
                );
              }
              const { Icon } = meta;
              return (
                <div key={meta.rank} className="flex w-1/3 flex-col items-center">
                  <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b ${meta.color} text-white shadow-lg ring-4 ${meta.ring}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <p className="truncate text-center text-base font-bold text-stone-800" title={winner.displayName}>
                    {winner.displayName}
                  </p>
                  <p className="text-xs text-stone-500">{meta.label}</p>
                  <div className={`mt-3 flex w-full flex-col items-center justify-end rounded-t-2xl bg-gradient-to-b ${meta.color} px-2 pb-3 pt-4 text-white shadow-md ${meta.height}`}>
                    <span className="font-bingo text-3xl drop-shadow-[0_2px_0_rgba(0,0,0,0.25)]">{meta.rank}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          {isHost ? <Button onClick={onPlayAgain}>Play Again</Button> : null}
          <Button variant="secondary" onClick={onDashboard}>Go to Dashboard</Button>
        </div>
      </div>
    </div>
  );
}
