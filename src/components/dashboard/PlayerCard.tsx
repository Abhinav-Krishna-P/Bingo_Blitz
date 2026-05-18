import { Send } from "lucide-react";
import type { SessionPresence } from "@/types/game";
import { Avatar } from "@/components/ui/avatar";

export function PlayerCard({
  player,
  canInvite,
  onInvite,
}: {
  player: SessionPresence;
  canInvite: boolean;
  onInvite: (uid: string) => void;
}) {
  return (
    <article className="rounded-2xl border border-white/15 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <Avatar src={player.photoURL} fallback={player.displayName} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">{player.displayName}</p>
          <p className="text-xs uppercase tracking-[0.22em] text-white/55">{player.status}</p>
        </div>
        <span className="rounded-full border border-white/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-white/70">
          {player.subnet ?? "NO IP"}
        </span>
      </div>
      <button
        type="button"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canInvite}
        onClick={() => onInvite(player.uid)}
      >
        <Send className="h-4 w-4" />
        Invite
      </button>
    </article>
  );
}
