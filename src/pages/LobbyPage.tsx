import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Sparkles, Star } from "lucide-react";
import { GameSettings } from "@/components/lobby/GameSettings";
import { PlayerList } from "@/components/lobby/PlayerList";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { leaveGame, setPlayerReady, startGame, updateLobbySettings } from "@/firebase/game";
import { updatePresence } from "@/firebase/presence";
import { useAuth } from "@/hooks/useAuth";
import { useGameSubscription } from "@/hooks/useGame";

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

export function LobbyPage({ gameId }: { gameId: string }) {
  const { game, loading } = useGameSubscription(gameId);
  const { user, signOutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    void updatePresence(user.uid, { status: "in-lobby", currentGameId: gameId });
  }, [gameId, user]);

  useEffect(() => {
    if (!game && !loading) {
      toast.error("Lobby closed.");
      navigate("/dashboard");
      return;
    }

    if (game?.status === "in-progress") {
      navigate(`/game/${gameId}`);
    }
  }, [game, gameId, loading, navigate]);

  if (loading || !game) {
    return <LoadingSpinner label="Synchronizing lobby..." />;
  }

  const activeGame = game;
  const isHost = user?.uid === activeGame.hostId;
  const myPlayer = user ? activeGame.players[user.uid] : undefined;
  const cantStart = Object.keys(activeGame.players).length < activeGame.settings.minPlayers;

  async function handleLeave() {
    if (!user) return;
    try {
      await leaveGame(gameId, user.uid, isHost);
      await updatePresence(user.uid, { status: "idle", currentGameId: null });
      navigate("/dashboard");
      toast.success(isHost ? "Lobby closed." : "You left the lobby.");
    } catch (error) {
      console.error(error);
      toast.error("Could not leave the lobby.");
    }
  }

  async function handleSaveSettings(nextSettings: typeof activeGame.settings) {
    try {
      await updateLobbySettings(gameId, nextSettings);
      toast.success("Settings updated.");
    } catch (error) {
      console.error(error);
      toast.error("Could not save settings.");
    }
  }

  async function handleStart() {
    try {
      await startGame(gameId);
      toast.success("Game countdown started.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Could not start game.");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_85%_55%,#f97316_0%,#c026d3_28%,#7e22ce_55%,#4c1d95_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,200,120,0.28),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(126,34,206,0.4),transparent_50%)]" />

      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <DecorBingoCard
          className="-left-12 top-72"
          rotation="rotate(-10deg)"
          palette={{ frame: "bg-[#3b82f6]", header: "bg-[#1d4ed8]" }}
        />
        <DecorBingoCard
          className="-right-8 top-72"
          rotation="rotate(8deg)"
          palette={{ frame: "bg-[#ec4899]", header: "bg-[#be185d]" }}
          freeAt={[1, 2]}
        />
        <DecorBall className="left-12 top-44" label={37} letter="N" color="from-[#60a5fa] to-[#2563eb]" />
        <DecorBall className="left-28 top-[36rem]" label={17} color="from-[#a78bfa] to-[#7c3aed]" />
        <DecorBall className="right-10 top-52" label={8} letter="B" color="from-[#fdba74] to-[#ea580c]" />
        <DecorBall className="right-32 top-[38rem]" label={22} color="from-[#86efac] to-[#16a34a]" />

        <Star className="absolute left-44 top-96 h-7 w-7 fill-[#fbbf24] text-[#fbbf24] drop-shadow" />
        <Star className="absolute right-44 top-44 h-6 w-6 fill-[#fbbf24] text-[#fbbf24] drop-shadow" />
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

        <section className="relative mt-8 rounded-[28px] border border-pink-300/35 bg-[#3b1175]/55 p-7 shadow-[0_18px_50px_rgba(20,8,50,0.45)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/8" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-white/60">Party Code</p>
              <h1 className="mt-2 font-display text-4xl tracking-[0.22em] text-white">{activeGame.partyCode}</h1>
              <p className="mt-2 text-sm text-white/55">Internal game id: {activeGame.gameId}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {!isHost && user && myPlayer ? (
                <button
                  type="button"
                  onClick={() => void setPlayerReady(gameId, user.uid, !myPlayer.ready)}
                  className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  {myPlayer.ready ? "Set Pending" : "Set Ready"}
                </button>
              ) : null}
              {isHost ? (
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={cantStart}
                  className="rounded-full bg-[#ec4899] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(236,72,153,0.5)] transition hover:-translate-y-0.5 hover:bg-[#f472b6] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Start Game
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleLeave}
                className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Leave
              </button>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <GameSettings settings={activeGame.settings} isHost={isHost} onSave={handleSaveSettings} />
          <PlayerList game={activeGame} />
        </div>
      </div>
    </div>
  );
}
