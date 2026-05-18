import { Hourglass } from "lucide-react";
import type { GamePlayer } from "@/types/game";
import { Avatar } from "@/components/ui/avatar";

export function TurnIndicator({
  activePlayer,
  isMyTurn,
  secondsLeft,
}: {
  activePlayer: GamePlayer | null;
  isMyTurn: boolean;
  secondsLeft: number;
}) {
  return (
    <div className="rounded-3xl border border-pink-100 bg-white p-5 shadow-[0_8px_24px_rgba(236,72,153,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ec4899]">Current Turn</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {activePlayer ? (
            <>
              <Avatar src={activePlayer.photoURL} fallback={activePlayer.displayName} />
              <div>
                <p className="font-bold text-stone-800">
                  {isMyTurn ? "You" : activePlayer.displayName}
                </p>
                <p className="text-xs text-stone-500">
                  {isMyTurn ? "It's your turn to pick number." : "Picking a number..."}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-stone-500">Waiting for the round to begin.</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-pink-50 px-3 py-1.5">
          <Hourglass className="h-4 w-4 text-[#ec4899]" />
          <span className="text-sm font-bold text-[#ec4899]">{secondsLeft}s</span>
        </div>
      </div>
    </div>
  );
}
