import type { GameDocument } from "@/types/game";
import { Avatar } from "@/components/ui/avatar";

export function PlayerList({
  game,
}: {
  game: GameDocument;
}) {
  return (
    <section className="relative rounded-[28px] border border-pink-300/35 bg-[#3b1175]/55 p-7 shadow-[0_18px_50px_rgba(20,8,50,0.45)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/8" />
      <p className="relative text-xs uppercase tracking-[0.32em] text-white/60">Roster</p>
      <h2 className="relative mt-2 text-3xl font-bold text-white">Player List</h2>

      <div className="relative mt-6 space-y-3">
        {Object.values(game.players).map((player) => (
          <div
            key={player.uid}
            className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 p-4"
          >
            <div className="flex items-center gap-3">
              <Avatar src={player.photoURL} fallback={player.displayName} />
              <div>
                <p className="font-semibold text-white">{player.displayName}</p>
                <p className="text-xs uppercase tracking-[0.22em] text-white/55">
                  {player.uid === game.hostId ? "HOST" : "PLAYER"}
                </p>
              </div>
            </div>
            <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/85">
              {player.ready ? "READY" : "PENDING"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
