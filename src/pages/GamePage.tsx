import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { BingoBoard } from "@/components/game/BingoBoard";
import { GameTimer } from "@/components/game/GameTimer";
import { TurnIndicator } from "@/components/game/NumberCaller";
import { PlayerStatus } from "@/components/game/PlayerStatus";
import { WinnerOverlay } from "@/components/game/WinnerOverlay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { abortGame, autoSkipTurn, claimBingo, leaveGame, pickNumber, resetGame } from "@/firebase/game";
import { hasWon } from "@/utils/bingo";
import { updatePresence } from "@/firebase/presence";
import { useAuth } from "@/hooks/useAuth";
import { useGameSubscription } from "@/hooks/useGame";

export function GamePage({ gameId }: { gameId: string }) {
  const { game, loading } = useGameSubscription(gameId);
  const { user, signOutUser } = useAuth();
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);
  const currentGame = game;
  const currentUser = user;
  const player = useMemo(
    () => (currentUser && currentGame ? currentGame.players[currentUser.uid] : null),
    [currentGame, currentUser],
  );
  const isHost = currentUser?.uid === currentGame?.hostId;
  const isMyTurn = Boolean(
    currentUser && currentGame?.currentTurnUid === currentUser.uid && currentGame?.status === "in-progress",
  );
  const activeTurnPlayer = currentGame?.currentTurnUid
    ? currentGame.players[currentGame.currentTurnUid] ?? null
    : null;

  useEffect(() => {
    if (!user) return;
    void updatePresence(user.uid, { status: "in-game", currentGameId: gameId });
  }, [gameId, user]);

  useEffect(() => {
    if (loading) return;
    if (!currentGame) {
      toast("The host ended the game.");
      navigate("/dashboard");
      return;
    }
    if (currentGame.status === "waiting") {
      navigate(`/lobby/${gameId}`);
    }
  }, [currentGame, gameId, loading, navigate]);

  useEffect(() => {
    if (!currentGame || currentGame.status !== "in-progress" || !currentGame.turnDeadline) {
      setSecondsLeft(0);
      return undefined;
    }

    const deadline = currentGame.turnDeadline;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };

    tick();
    const ticker = window.setInterval(tick, 250);
    return () => window.clearInterval(ticker);
  }, [currentGame]);

  useEffect(() => {
    if (!currentGame || !currentUser) return;
    if (currentGame.status !== "in-progress") return;
    if (!currentGame.currentTurnUid || !currentGame.turnDeadline) return;
    if (currentGame.currentTurnUid !== currentUser.uid && currentGame.hostId !== currentUser.uid) return;

    const deadline = currentGame.turnDeadline;
    const delay = Math.max(0, deadline - Date.now()) + 200;
    const timer = window.setTimeout(() => {
      void autoSkipTurn(gameId, deadline).catch(() => undefined);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [currentGame, currentUser, gameId]);

  if (loading || !currentGame || !player) {
    return <LoadingSpinner label="Entering active board..." />;
  }

  const activeGame = currentGame;
  const activePlayer = player;
  const myPodiumIndex = activeGame.winners.findIndex((w) => w.uid === activePlayer.uid);
  const myPodiumRank = myPodiumIndex >= 0 ? myPodiumIndex + 1 : null;
  const canClaimBingo =
    activeGame.status === "in-progress"
    && myPodiumRank === null
    && hasWon(activePlayer.card, activeGame.calledNumbers);

  async function handlePick(row: number, col: number) {
    if (!isMyTurn) {
      toast.error("It is not your turn yet.");
      return;
    }
    const value = activePlayer.card[row]?.[col];
    if (value == null) return;
    if (activeGame.calledNumbers.includes(value)) return;

    try {
      await pickNumber(gameId, activePlayer.uid, value);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Could not pick number.");
    }
  }

  async function handleLeave() {
    if (!currentUser) return;
    try {
      await leaveGame(gameId, currentUser.uid, Boolean(isHost));
      await updatePresence(currentUser.uid, { status: "idle", currentGameId: null });
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Could not leave the game.");
    }
  }

  async function handleClaimBingo() {
    if (!currentUser || !canClaimBingo) return;
    try {
      await claimBingo(gameId, currentUser.uid);
      toast.success("BINGO! You won.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Could not claim BINGO.");
    }
  }

  async function handleAbortConfirmed() {
    if (!currentUser || !isHost) return;
    setShowAbortConfirm(false);
    try {
      await abortGame(gameId, currentUser.uid);
      await updatePresence(currentUser.uid, { status: "idle", currentGameId: null });
      toast.success("Game aborted.");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Could not abort the game.");
    }
  }

  const lastPickPlayerName = (() => {
    if (!activeGame.currentNumber) return null;
    for (const p of Object.values(activeGame.players)) {
      if (p.card.some((row) => row.includes(activeGame.currentNumber as number))) {
        return p.displayName;
      }
    }
    return null;
  })();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#fef7f3] via-[#fdf2f8] to-[#fce7e9] text-stone-800">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(252,231,243,0.6),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_95%,rgba(254,205,211,0.5),transparent_50%)]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="font-bingo text-3xl leading-none">
              <span className="text-stone-800">Bingo</span>
              <span className="ml-2 text-[#ec4899]">Blitz</span>
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.32em] text-stone-500">Multiplayer party rooms</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-pink-100 bg-white text-stone-700 shadow-sm transition hover:border-pink-200 hover:text-[#ec4899]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 rounded-full border border-pink-100 bg-white px-2 py-1.5 shadow-sm transition hover:border-pink-200">
                <Avatar src={user?.photoURL} fallback={user?.displayName ?? "Player"} />
                <div className="hidden pr-2 text-left md:block">
                  <p className="text-sm font-bold text-stone-800">{user?.displayName}</p>
                  <p className="text-xs text-stone-500">{user?.email}</p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => void signOutUser()}>
                  <LogOut className="mr-2 h-4 w-4 text-[#ec4899]" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-[0_8px_24px_rgba(236,72,153,0.08)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ec4899]">Party Code</p>
                  <h1 className="mt-2 font-display text-3xl tracking-[0.18em] text-stone-800">
                    {activeGame.partyCode}
                  </h1>
                  <p className="mt-1 text-xs text-stone-500">Internal game id: {activeGame.gameId}</p>
                </div>
                <div className="flex gap-3">
                  {isHost ? (
                    <button
                      type="button"
                      onClick={() => setShowAbortConfirm(true)}
                      className="rounded-full bg-[#ec4899] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(236,72,153,0.35)] transition hover:-translate-y-0.5 hover:bg-[#db2777]"
                    >
                      Abort Game
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleLeave}
                    className="rounded-full border border-pink-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-pink-300 hover:text-[#ec4899]"
                  >
                    Leave
                  </button>
                </div>
              </div>
            </div>

            <BingoBoard
              card={activePlayer.card}
              calledNumbers={activeGame.calledNumbers}
              currentNumber={activeGame.currentNumber}
              isMyTurn={isMyTurn}
              onPick={handlePick}
            />
          </div>

          <div className="space-y-5">
            {(() => {
              if (myPodiumRank !== null) {
                const rankLabel = myPodiumRank === 1 ? "1st" : myPodiumRank === 2 ? "2nd" : "3rd";
                const gradient =
                  myPodiumRank === 1
                    ? "bg-gradient-to-b from-[#fde68a] to-[#d97706] shadow-[0_10px_0_#92400e,0_18px_30px_rgba(217,119,6,0.45)]"
                    : myPodiumRank === 2
                      ? "bg-gradient-to-b from-[#e5e7eb] to-[#9ca3af] shadow-[0_10px_0_#4b5563,0_18px_30px_rgba(75,85,99,0.45)]"
                      : "bg-gradient-to-b from-[#fdba74] to-[#c2410c] shadow-[0_10px_0_#7c2d12,0_18px_30px_rgba(194,65,12,0.45)]";
                return (
                  <div className={`relative w-full select-none rounded-3xl px-8 py-6 text-center font-bingo text-3xl tracking-[0.18em] text-white ${gradient}`}>
                    <span className="block drop-shadow-[0_3px_0_rgba(0,0,0,0.25)]">{rankLabel} Place</span>
                    <span className="mt-1 block font-sans text-[10px] font-semibold uppercase tracking-[0.32em] text-white/90">
                      You secured podium spot {myPodiumRank}
                    </span>
                  </div>
                );
              }
              return (
                <button
                  type="button"
                  disabled={!canClaimBingo}
                  onClick={() => void handleClaimBingo()}
                  className={`group relative w-full select-none rounded-3xl px-8 py-6 text-center font-bingo text-4xl tracking-[0.18em] text-white transition active:translate-y-1 ${
                    canClaimBingo
                      ? "bg-gradient-to-b from-[#ff5fa2] to-[#d6006c] shadow-[0_10px_0_#8a003f,0_18px_30px_rgba(214,0,108,0.45)] hover:from-[#ff77b1] hover:to-[#e60a76] active:shadow-[0_4px_0_#8a003f,0_8px_18px_rgba(214,0,108,0.4)] cursor-pointer animate-pulse"
                      : "bg-gradient-to-b from-stone-300 to-stone-400 text-white/80 shadow-[0_6px_0_#9c9c9c] cursor-not-allowed opacity-80"
                  }`}
                  aria-label="Claim BINGO"
                >
                  <span className="block drop-shadow-[0_3px_0_rgba(0,0,0,0.25)]">BINGO!</span>
                  <span className="mt-1 block font-sans text-[10px] font-semibold uppercase tracking-[0.32em] text-white/85">
                    {canClaimBingo
                      ? "Tap to win — fastest finger!"
                      : activeGame.winners.length > 0
                        ? `Compete for spot ${activeGame.winners.length + 1}`
                        : "Complete 5 lines to activate"}
                  </span>
                </button>
              );
            })()}

            <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-[0_8px_24px_rgba(236,72,153,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ec4899]">Last Pick</p>
              <p className="mt-3 text-5xl font-bold text-stone-800">{activeGame.currentNumber ?? "--"}</p>
              <p className="mt-2 text-sm text-stone-500">
                {activeGame.currentNumber
                  ? `${lastPickPlayerName ?? "Someone"} picked number.`
                  : "Waiting for the first pick."}
              </p>
            </div>

            <TurnIndicator
              activePlayer={activeTurnPlayer}
              isMyTurn={isMyTurn}
              secondsLeft={secondsLeft}
            />

            <GameTimer
              secondsLeft={secondsLeft}
              totalSeconds={activeGame.settings.turnDurationSeconds}
              isMyTurn={isMyTurn}
            />

            <PlayerStatus game={activeGame} />
          </div>
        </section>
      </div>

      {showAbortConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-pink-100 bg-white p-7 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ec4899]">Confirm</p>
            <h2 className="mt-2 text-2xl font-bold text-stone-800">Abort this game?</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              All players (including you) will be removed from the game and sent back to the dashboard. This cannot be undone.
            </p>
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAbortConfirm(false)}
                className="rounded-full border border-pink-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-pink-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleAbortConfirmed()}
                className="rounded-full bg-[#ec4899] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(236,72,153,0.35)] transition hover:bg-[#db2777]"
              >
                Abort Game
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {activeGame.status === "finished" ? (
        <WinnerOverlay
          winners={activeGame.winners}
          isHost={Boolean(isHost)}
          onPlayAgain={() => void resetGame(gameId)}
          onDashboard={() => navigate("/dashboard")}
        />
      ) : null}
    </div>
  );
}
