import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { subscribeToPendingInvites, updateInviteStatus } from "@/firebase/invites";
import { joinGame } from "@/firebase/game";
import { useAuth } from "@/hooks/useAuth";
import type { InviteDocument } from "@/types/game";

export function InviteNotification() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [invites, setInvites] = useState<InviteDocument[]>([]);

  useEffect(() => {
    if (!user) return undefined;
    return subscribeToPendingInvites(user.uid, setInvites);
  }, [user]);

  const activeInvite = useMemo(() => invites[0] ?? null, [invites]);

  useEffect(() => {
    if (!activeInvite || !session) return;
    const createdAtMs = activeInvite.createdAt?.toMillis?.();
    if (createdAtMs && Date.now() - createdAtMs > 60_000) {
      void updateInviteStatus(activeInvite.inviteId, "expired");
      return;
    }

    toast(
      (instance) => (
        <div className="space-y-3">
          <p className="text-sm text-[#2a1f15]">
            <span className="font-semibold">{activeInvite.fromName}</span> invited you to a Bingo lobby.
          </p>
          <div className="flex gap-2">
            <button
              className="rounded-full bg-[#b3001b] px-3 py-1.5 text-xs font-semibold text-white"
              onClick={async () => {
                try {
                  await joinGame(activeInvite.gameId, session);
                  await updateInviteStatus(activeInvite.inviteId, "accepted");
                  toast.dismiss(instance.id);
                  navigate(`/lobby/${activeInvite.gameId}`);
                } catch (error) {
                  console.error(error);
                  toast.error(error instanceof Error ? error.message : "Could not join game.");
                }
              }}
            >
              Accept
            </button>
            <button
              className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-[#2a1f15]"
              onClick={() => {
                void updateInviteStatus(activeInvite.inviteId, "rejected");
                toast.dismiss(instance.id);
              }}
            >
              Reject
            </button>
          </div>
        </div>
      ),
      { id: `invite-${activeInvite.inviteId}` },
    );
  }, [activeInvite, navigate, session]);

  return null;
}
