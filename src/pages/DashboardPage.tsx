import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Bell, LogOut, Sparkles, Star } from "lucide-react";
import { HostPanel } from "@/components/dashboard/HostPanel";
import { JoinPanel } from "@/components/dashboard/JoinPanel";
import { PlayerCard } from "@/components/dashboard/PlayerCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createGame, findGameByPartyCode, joinGame } from "@/firebase/game";
import { createInvite } from "@/firebase/invites";
import { db } from "@/firebase/config";
import { updatePresence } from "@/firebase/presence";
import { useAuth } from "@/hooks/useAuth";
import type { SessionPresence } from "@/types/game";

const BINGO_HEADER = ["B", "I", "N", "G", "O"] as const;

function DecorBingoCard({
  className,
  rotation,
  palette,
  freeAt,
}: {
  className?: string;
  rotation: string;
  palette: { frame: string; header: string };
  freeAt?: [number, number];
}) {
  const numbers = [
    [12, 18, 41, 47, 61],
    [7, 26, 39, 54, 70],
    [4, 22, 36, 56, 65],
    [9, 28, 35, 50, 73],
    [11, 24, 44, 58, 67],
  ];
  return (
    <div className={`absolute select-none ${className ?? ""}`} style={{ transform: rotation }} aria-hidden="true">
      <div className={`rounded-3xl p-3 shadow-[0_24px_60px_rgba(20,8,50,0.55)] ${palette.frame}`}>
        <div className={`grid grid-cols-5 gap-1 rounded-t-2xl ${palette.header} p-1.5`}>
          {BINGO_HEADER.map((letter) => (
            <div key={letter} className="flex h-7 w-9 items-center justify-center font-bingo text-sm text-white drop-shadow">
              {letter}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-1 rounded-b-2xl bg-[#fffaf0] p-1.5">
          {numbers.flat().map((value, index) => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            const isFree = freeAt && freeAt[0] === row && freeAt[1] === col;
            return (
              <div
                key={index}
                className={`flex h-8 w-9 items-center justify-center rounded-md text-[11px] font-bold ${
                  isFree ? "bg-[#e91e63] text-white" : "bg-white text-[#231a45]"
                }`}
              >
                {isFree ? "FREE" : value}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DecorBall({
  className,
  label,
  letter,
  color,
}: {
  className?: string;
  label: number;
  letter?: string;
  color: string;
}) {
  return (
    <div
      className={`absolute flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${color} text-white shadow-[0_14px_32px_rgba(0,0,0,0.4)] ring-4 ring-white/70 ${className ?? ""}`}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center leading-none">
        {letter ? <span className="font-bingo text-[10px]">{letter}</span> : null}
        <span className="font-bingo text-xl">{label}</span>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { session, user, firebaseReady, signOutUser } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<SessionPresence[]>([]);
  const [partyCode, setPartyCode] = useState("");

  useEffect(() => {
    if (!user) return;
    void updatePresence(user.uid, { status: "idle", currentGameId: null });
  }, [user]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "sessions"), where("online", "==", true)),
      (snapshot) => {
        setPlayers(
          snapshot.docs
            .map((entry) => entry.data() as SessionPresence)
            .filter((entry) => entry.uid !== user?.uid),
        );
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  const hostingLocked = useMemo(() => !firebaseReady || !session, [firebaseReady, session]);

  if (!session && firebaseReady) {
    return <LoadingSpinner label="Loading command room..." />;
  }

  async function handleHost() {
    if (!session) return;
    try {
      const gameId = await createGame(session);
      await updatePresence(session.uid, { status: "in-lobby", currentGameId: gameId });
      navigate(`/lobby/${gameId}`);
    } catch (error) {
      console.error(error);
      toast.error("Unable to host a game.");
    }
  }

  async function handleJoinByCode() {
    if (!session) return;

    try {
      const game = await findGameByPartyCode(partyCode);
      await joinGame(game.gameId, session);
      await updatePresence(session.uid, { status: "in-lobby", currentGameId: game.gameId });
      navigate(`/lobby/${game.gameId}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Unable to join by code.");
    }
  }

  async function handleInvite(playerId: string) {
    if (!session?.currentGameId || !user) {
      toast.error("Host a lobby before sending invites.");
      return;
    }

    try {
      await createInvite(session.currentGameId, user.uid, user.displayName ?? "Host", playerId);
      toast.success("Invite sent.");
    } catch (error) {
      console.error(error);
      toast.error("Invite failed.");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_85%_55%,#f97316_0%,#c026d3_28%,#7e22ce_55%,#4c1d95_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,200,120,0.28),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(126,34,206,0.4),transparent_50%)]" />

      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <DecorBingoCard
          className="-left-12 top-44"
          rotation="rotate(-10deg)"
          palette={{ frame: "bg-[#3b82f6]", header: "bg-[#1d4ed8]" }}
        />
        <DecorBingoCard
          className="-right-8 top-52"
          rotation="rotate(8deg)"
          palette={{ frame: "bg-[#ec4899]", header: "bg-[#be185d]" }}
          freeAt={[1, 2]}
        />
        <DecorBall className="left-12 top-24" label={37} letter="N" color="from-[#60a5fa] to-[#2563eb]" />
        <DecorBall className="left-28 top-[28rem]" label={17} color="from-[#a78bfa] to-[#7c3aed]" />
        <DecorBall className="right-10 top-32" label={8} letter="B" color="from-[#fdba74] to-[#ea580c]" />
        <DecorBall className="right-32 top-[30rem]" label={22} color="from-[#86efac] to-[#16a34a]" />

        <Star className="absolute left-44 top-72 h-7 w-7 fill-[#fbbf24] text-[#fbbf24] drop-shadow" />
        <Star className="absolute right-44 top-24 h-6 w-6 fill-[#fbbf24] text-[#fbbf24] drop-shadow" />
        <Sparkles className="absolute left-1/2 top-12 h-6 w-6 text-[#fbbf24]/80" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="font-bingo text-3xl leading-none">
              <span className="text-white">Bingo</span>
              <span className="ml-2 text-[#fbbf24]">Blitz</span>
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.32em] text-white/55">Multiplayer party rooms</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/15"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-2 py-1.5 transition hover:bg-white/15">
                <Avatar src={user?.photoURL} fallback={user?.displayName ?? "Player"} />
                <div className="hidden pr-2 text-left md:block">
                  <p className="text-sm font-semibold text-white">{user?.displayName}</p>
                  <p className="text-xs text-white/65">{user?.email}</p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => void signOutUser()}>
                  <LogOut className="mr-2 h-4 w-4 text-[#b3001b]" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="mt-8 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-center text-sm text-white/75">
          Party-code mode is active. Hosts create a lobby and share the generated code. Other players can join from any device that can access this app and sign in.
        </div>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <HostPanel disabled={hostingLocked} onHost={handleHost} />
          <JoinPanel
            disabled={hostingLocked}
            partyCode={partyCode}
            onPartyCodeChange={setPartyCode}
            onJoinByCode={handleJoinByCode}
          />
        </section>

        <section className="relative mt-6 rounded-[28px] border border-pink-300/35 bg-[#3b1175]/55 p-7 shadow-[0_18px_50px_rgba(20,8,50,0.45)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/8" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-white/60">Presence Grid</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Online Players</h2>
            </div>
            <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/75">
              {players.length} online
            </span>
          </div>

          <div className="relative mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {players.length ? (
              players.map((player) => (
                <PlayerCard
                  key={player.uid}
                  player={player}
                  canInvite={Boolean(session?.currentGameId) && player.status === "idle"}
                  onInvite={handleInvite}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-8 text-sm text-white/70">
                No other active signed-in players detected right now.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
