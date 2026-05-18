import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { generatePartyCode } from "@/lib/utils";
import type {
  BingoCard,
  BingoCardCell,
  GameDocument,
  GamePlayer,
  GameSettings,
  GameWinner,
  SessionPresence,
} from "@/types/game";
import { generateBingoCard, hasWon } from "@/utils/bingo";

const DEFAULT_SETTINGS: GameSettings = {
  maxPlayers: 6,
  minPlayers: 2,
  turnDurationSeconds: 10,
  boardSize: 5,
};

const STARTING_DELAY_MS = 3_000;

type FirestoreRow<T> = { cells: T[] };

function serializeMatrix<T>(matrix: T[][]): FirestoreRow<T>[] {
  return matrix.map((row) => ({ cells: row }));
}

function deserializeMatrix<T>(value: unknown): T[][] {
  if (!Array.isArray(value)) return [];

  return value.map((row) => {
    if (Array.isArray(row)) return row as T[];
    if (row && typeof row === "object" && Array.isArray((row as FirestoreRow<T>).cells)) {
      return (row as FirestoreRow<T>).cells;
    }
    return [] as T[];
  });
}

function serializePlayer(player: GamePlayer) {
  return {
    uid: player.uid,
    displayName: player.displayName,
    photoURL: player.photoURL,
    card: serializeMatrix(player.card),
    hasWon: player.hasWon,
    ready: player.ready,
    disconnected: Boolean(player.disconnected),
    joinedAt: player.joinedAt ?? null,
  };
}

function deserializePlayer(player: Record<string, unknown>): GamePlayer {
  return {
    uid: String(player.uid ?? ""),
    displayName: String(player.displayName ?? "Unknown Player"),
    photoURL: String(player.photoURL ?? ""),
    card: deserializeMatrix<BingoCardCell>(player.card) as BingoCard,
    hasWon: Boolean(player.hasWon),
    ready: Boolean(player.ready),
    disconnected: Boolean(player.disconnected),
    joinedAt: (player.joinedAt ?? null) as GamePlayer["joinedAt"],
  };
}

function deserializeGame(data: Record<string, unknown>): GameDocument {
  const rawPlayers = (data.players ?? {}) as Record<string, Record<string, unknown>>;
  return {
    gameId: String(data.gameId ?? ""),
    partyCode: String(data.partyCode ?? ""),
    hostId: String(data.hostId ?? ""),
    hostName: String(data.hostName ?? ""),
    hostSubnet: (data.hostSubnet ?? null) as string | null,
    status: data.status as GameDocument["status"],
    settings: { ...DEFAULT_SETTINGS, ...(data.settings as Partial<GameSettings>) } as GameSettings,
    players: Object.fromEntries(
      Object.entries(rawPlayers).map(([uid, player]) => [uid, deserializePlayer(player)]),
    ),
    calledNumbers: Array.isArray(data.calledNumbers) ? (data.calledNumbers as number[]) : [],
    currentNumber: (data.currentNumber ?? null) as number | null,
    turnOrder: Array.isArray(data.turnOrder) ? (data.turnOrder as string[]) : [],
    currentTurnUid: (data.currentTurnUid ?? null) as string | null,
    turnDeadline: (data.turnDeadline ?? null) as number | null,
    winners: Array.isArray(data.winners) ? (data.winners as GameWinner[]) : [],
    startedAt: (data.startedAt ?? null) as GameDocument["startedAt"],
    finishedAt: (data.finishedAt ?? null) as GameDocument["finishedAt"],
    createdAt: (data.createdAt ?? null) as GameDocument["createdAt"],
  };
}

function createPlayer(session: SessionPresence, boardSize: number = DEFAULT_SETTINGS.boardSize): GamePlayer {
  return {
    uid: session.uid,
    displayName: session.displayName,
    photoURL: session.photoURL,
    card: generateBingoCard(boardSize),
    hasWon: false,
    ready: false,
    disconnected: false,
    joinedAt: null,
  };
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function nextEligibleUid(
  turnOrder: string[],
  currentUid: string | null,
  players: Record<string, GamePlayer>,
): string | null {
  if (!turnOrder.length) return null;
  const eligible = turnOrder.filter((uid) => {
    const player = players[uid];
    return player && !player.hasWon && !player.disconnected;
  });
  if (!eligible.length) return null;

  if (!currentUid) return eligible[0];
  const currentIndex = turnOrder.indexOf(currentUid);
  for (let step = 1; step <= turnOrder.length; step += 1) {
    const candidate = turnOrder[(currentIndex + step) % turnOrder.length];
    const player = players[candidate];
    if (player && !player.hasWon && !player.disconnected) {
      return candidate;
    }
  }
  return null;
}

async function createUniquePartyCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const partyCode = generatePartyCode();
    const snapshot = await getDocs(query(collection(db, "games"), where("partyCode", "==", partyCode)));
    if (snapshot.empty) return partyCode;
  }
  throw new Error("Could not generate a unique party code.");
}

export async function createGame(session: SessionPresence) {
  const gameRef = doc(collection(db, "games"));
  const hostPlayer = createPlayer(session);
  hostPlayer.ready = true;
  const partyCode = await createUniquePartyCode();

  await setDoc(gameRef, {
    gameId: gameRef.id,
    partyCode,
    hostId: session.uid,
    hostName: session.displayName,
    hostSubnet: session.subnet,
    status: "waiting",
    settings: DEFAULT_SETTINGS,
    players: {
      [session.uid]: {
        ...serializePlayer(hostPlayer),
        joinedAt: serverTimestamp(),
      },
    },
    calledNumbers: [],
    currentNumber: null,
    turnOrder: [],
    currentTurnUid: null,
    turnDeadline: null,
    winners: [],
    startedAt: null,
    finishedAt: null,
    createdAt: serverTimestamp(),
  });

  return gameRef.id;
}

export async function joinGame(gameId: string, session: SessionPresence) {
  const gameRef = doc(db, "games", gameId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(gameRef);
    if (!snapshot.exists()) throw new Error("Game not found.");

    const game = deserializeGame(snapshot.data() as Record<string, unknown>);
    if (game.status !== "waiting") throw new Error("This game already started.");
    if (Object.keys(game.players).length >= game.settings.maxPlayers) throw new Error("This game is full.");

    transaction.update(gameRef, {
      [`players.${session.uid}`]: {
        ...serializePlayer(createPlayer(session, game.settings.boardSize)),
        joinedAt: serverTimestamp(),
      },
    });
  });
}

export async function findGameByPartyCode(partyCode: string) {
  const normalized = partyCode.trim().toUpperCase();
  const snapshot = await getDocs(
    query(collection(db, "games"), where("partyCode", "==", normalized), where("status", "==", "waiting")),
  );

  if (snapshot.empty) {
    throw new Error("No waiting game found for that party code.");
  }

  return deserializeGame(snapshot.docs[0].data() as Record<string, unknown>);
}

export async function leaveGame(gameId: string, userId: string, isHost: boolean) {
  const gameRef = doc(db, "games", gameId);
  if (isHost) {
    await deleteDoc(gameRef);
    return;
  }

  const snapshot = await getDoc(gameRef);
  if (!snapshot.exists()) return;
  const game = deserializeGame(snapshot.data() as Record<string, unknown>);
  const nextPlayers = { ...game.players };
  delete nextPlayers[userId];
  await updateDoc(gameRef, {
    players: Object.fromEntries(
      Object.entries(nextPlayers).map(([uid, player]) => [uid, serializePlayer(player)]),
    ),
  });
}

export async function updateLobbySettings(gameId: string, settings: GameSettings) {
  await updateDoc(doc(db, "games", gameId), { settings });
}

export async function setPlayerReady(gameId: string, userId: string, ready: boolean) {
  await updateDoc(doc(db, "games", gameId), { [`players.${userId}.ready`]: ready });
}

export async function startGame(gameId: string) {
  const gameRef = doc(db, "games", gameId);
  const snapshot = await getDoc(gameRef);
  if (!snapshot.exists()) throw new Error("Game not found.");

  const game = deserializeGame(snapshot.data() as Record<string, unknown>);
  if (Object.keys(game.players).length < game.settings.minPlayers) {
    throw new Error("Minimum players not met.");
  }

  const nextPlayers = Object.fromEntries(
    Object.entries(game.players).map(([uid, player]) => [
      uid,
      serializePlayer({
        ...player,
        card: generateBingoCard(game.settings.boardSize),
        hasWon: false,
        ready: true,
      }),
    ]),
  );

  const turnOrder = shuffle(Object.keys(nextPlayers));

  await updateDoc(gameRef, {
    players: nextPlayers,
    calledNumbers: [],
    currentNumber: null,
    turnOrder,
    currentTurnUid: null,
    turnDeadline: null,
    winners: [],
    finishedAt: null,
    status: "starting",
    startedAt: serverTimestamp(),
  });

  window.setTimeout(() => {
    void updateDoc(gameRef, {
      status: "in-progress",
      currentTurnUid: turnOrder[0],
      turnDeadline: Date.now() + game.settings.turnDurationSeconds * 1000,
      startedAt: serverTimestamp(),
    });
  }, STARTING_DELAY_MS);
}


export async function pickNumber(gameId: string, userId: string, value: number) {
  const gameRef = doc(db, "games", gameId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(gameRef);
    if (!snapshot.exists()) throw new Error("Game not found.");
    const game = deserializeGame(snapshot.data() as Record<string, unknown>);
    if (game.status !== "in-progress") throw new Error("Game is not in progress.");
    if (game.currentTurnUid !== userId) throw new Error("It is not your turn.");
    if (game.calledNumbers.includes(value)) throw new Error("That number was already picked.");

    const player = game.players[userId];
    if (!player) throw new Error("You are not part of this game.");
    const onCard = player.card.some((row) => row.includes(value));
    if (!onCard) throw new Error("That number is not on your board.");

    const calledNumbers = [...game.calledNumbers, value];

    const nextUid = nextEligibleUid(game.turnOrder, userId, game.players);
    transaction.update(gameRef, {
      calledNumbers,
      currentNumber: value,
      currentTurnUid: nextUid,
      turnDeadline: nextUid ? Date.now() + game.settings.turnDurationSeconds * 1000 : null,
    });
  });
}

const MAX_PODIUM_POSITIONS = 3;

export async function claimBingo(gameId: string, userId: string) {
  const gameRef = doc(db, "games", gameId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(gameRef);
    if (!snapshot.exists()) throw new Error("Game not found.");
    const game = deserializeGame(snapshot.data() as Record<string, unknown>);
    if (game.status !== "in-progress") throw new Error("Game is not in progress.");
    if (game.winners.some((w) => w.uid === userId)) {
      throw new Error("You already claimed a podium spot.");
    }
    if (game.winners.length >= MAX_PODIUM_POSITIONS) {
      throw new Error("All podium positions are filled.");
    }

    const player = game.players[userId];
    if (!player) throw new Error("You are not part of this game.");
    if (!hasWon(player.card, game.calledNumbers)) {
      throw new Error("You don't have a valid BINGO yet.");
    }

    const winners = [...game.winners, { uid: userId, displayName: player.displayName }];
    const updatedPlayers = Object.fromEntries(
      Object.entries(game.players).map(([uid, p]) => [
        uid,
        serializePlayer({ ...p, hasWon: p.hasWon || uid === userId }),
      ]),
    );

    const totalPlayers = Object.keys(game.players).length;
    const maxWinnersPossible = Math.min(MAX_PODIUM_POSITIONS, totalPlayers - 1);
    const isFinalWinner = winners.length >= maxWinnersPossible || winners.length >= MAX_PODIUM_POSITIONS;

    if (isFinalWinner) {
      transaction.update(gameRef, {
        players: updatedPlayers,
        winners,
        status: "finished",
        currentTurnUid: null,
        turnDeadline: null,
        finishedAt: serverTimestamp(),
      });
      return;
    }

    // Game continues for remaining podium spots. If the new winner was the active player,
    // advance the turn to the next eligible (non-winner) player.
    let nextTurnUid = game.currentTurnUid;
    let nextDeadline = game.turnDeadline;
    if (game.currentTurnUid === userId) {
      nextTurnUid = nextEligibleUid(
        game.turnOrder,
        userId,
        Object.fromEntries(
          Object.entries(game.players).map(([uid, p]) => [
            uid,
            { ...p, hasWon: p.hasWon || uid === userId },
          ]),
        ),
      );
      nextDeadline = nextTurnUid ? Date.now() + game.settings.turnDurationSeconds * 1000 : null;
    }

    transaction.update(gameRef, {
      players: updatedPlayers,
      winners,
      currentTurnUid: nextTurnUid,
      turnDeadline: nextDeadline,
    });
  });
}

export async function autoSkipTurn(gameId: string, expectedDeadline: number) {
  const gameRef = doc(db, "games", gameId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(gameRef);
    if (!snapshot.exists()) return;
    const game = deserializeGame(snapshot.data() as Record<string, unknown>);
    if (game.status !== "in-progress") return;
    if (!game.currentTurnUid || game.turnDeadline !== expectedDeadline) return;
    if (Date.now() < game.turnDeadline) return;

    const nextUid = nextEligibleUid(game.turnOrder, game.currentTurnUid, game.players);
    if (!nextUid) {
      transaction.update(gameRef, {
        status: "finished",
        currentTurnUid: null,
        turnDeadline: null,
        finishedAt: serverTimestamp(),
      });
      return;
    }

    transaction.update(gameRef, {
      currentTurnUid: nextUid,
      turnDeadline: Date.now() + game.settings.turnDurationSeconds * 1000,
    });
  });
}

export async function abortGame(gameId: string, hostId: string) {
  const gameRef = doc(db, "games", gameId);
  const snapshot = await getDoc(gameRef);
  if (!snapshot.exists()) return;
  const game = deserializeGame(snapshot.data() as Record<string, unknown>);
  if (game.hostId !== hostId) throw new Error("Only the host can abort the game.");
  await deleteDoc(gameRef);
}

export async function resetGame(gameId: string) {
  const gameRef = doc(db, "games", gameId);
  const snapshot = await getDoc(gameRef);
  if (!snapshot.exists()) return;

  const game = deserializeGame(snapshot.data() as Record<string, unknown>);
  const players = Object.fromEntries(
    Object.entries(game.players).map(([uid, player]) => [
      uid,
      serializePlayer({
        ...player,
        card: generateBingoCard(game.settings.boardSize),
        hasWon: false,
        ready: uid === game.hostId,
      }),
    ]),
  );

  await updateDoc(gameRef, {
    players,
    calledNumbers: [],
    currentNumber: null,
    turnOrder: [],
    currentTurnUid: null,
    turnDeadline: null,
    winners: [],
    status: "waiting",
    startedAt: null,
    finishedAt: null,
  });
}

export function subscribeToGame(gameId: string, callback: (game: GameDocument | null) => void) {
  return onSnapshot(doc(db, "games", gameId), (snapshot) => {
    callback(snapshot.exists() ? deserializeGame(snapshot.data() as Record<string, unknown>) : null);
  });
}

export function subscribeToOpenGames(callback: (games: GameDocument[]) => void) {
  return onSnapshot(
    query(collection(db, "games"), where("status", "==", "waiting")),
    (snapshot) =>
      callback(
        snapshot.docs
          .map((entry) => deserializeGame(entry.data() as Record<string, unknown>))
          .sort((left, right) => {
            const leftMs = left.createdAt?.toMillis?.() ?? 0;
            const rightMs = right.createdAt?.toMillis?.() ?? 0;
            return rightMs - leftMs;
          }),
      ),
  );
}
