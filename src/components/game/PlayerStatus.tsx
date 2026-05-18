import { Hourglass, Trophy } from "lucide-react";
import type { GameDocument } from "@/types/game";
import { Avatar } from "@/components/ui/avatar";
import { BINGO_LETTERS, LETTERS_TO_WIN, lettersEarned } from "@/utils/bingo";

export function PlayerStatus({ game }: { game: GameDocument }) {
  return (
    <div className="rounded-3xl border border-pink-100 bg-white p-5 shadow-[0_8px_24px_rgba(236,72,153,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ec4899]">Squad Status</p>
      <div className="mt-4 space-y-3">
        {(game.turnOrder.length
          ? game.turnOrder.map((uid) => game.players[uid]).filter(Boolean)
          : Object.values(game.players)
        ).map((player) => {
          const earned = lettersEarned(player.card, game.calledNumbers);
          const isActive = game.currentTurnUid === player.uid;
          return (
            <div
              key={player.uid}
              className={`flex items-center gap-3 rounded-2xl p-3 transition ${
                isActive ? "bg-pink-50" : "bg-stone-50"
              }`}
            >
              <Avatar src={player.photoURL} fallback={player.displayName} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-bold text-stone-800">{player.displayName}</p>
                  {player.hasWon ? <Trophy className="h-4 w-4 text-yellow-400" /> : null}
                  {isActive ? <Hourglass className="h-4 w-4 text-[#ec4899]" /> : null}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  {BINGO_LETTERS.map((letter, index) => {
                    const isEarned = index < earned;
                    return (
                      <span
                        key={letter}
                        className={`h-2.5 w-2.5 rounded-full transition ${
                          isEarned
                            ? "bg-[#ec4899] shadow-[0_2px_4px_rgba(236,72,153,0.45)]"
                            : "border border-stone-300 bg-white"
                        }`}
                        aria-label={letter}
                      />
                    );
                  })}
                </div>
              </div>
              <span className="text-sm font-semibold text-stone-600">
                {earned}/{LETTERS_TO_WIN}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
