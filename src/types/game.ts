import type { Timestamp } from "firebase/firestore";

export type SessionStatus = "idle" | "in-lobby" | "in-game";
export type GameStatus = "waiting" | "starting" | "in-progress" | "finished";
export type InviteStatus = "pending" | "accepted" | "rejected" | "expired";
export type BingoCardCell = number;
export type BingoCard = BingoCardCell[][];

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  currentGameId: string | null;
  online: boolean;
  lastSeen?: Timestamp | null;
  localIP?: string | null;
  subnet?: string | null;
  gamesPlayed: number;
  gamesWon: number;
  createdAt?: Timestamp | null;
}

export interface SessionPresence {
  uid: string;
  displayName: string;
  photoURL: string;
  localIP: string | null;
  subnet: string | null;
  online: boolean;
  lastPing?: Timestamp | null;
  status: SessionStatus;
  currentGameId: string | null;
}

export interface GameSettings {
  maxPlayers: number;
  minPlayers: number;
  turnDurationSeconds: number;
  boardSize: number;
}

export interface GamePlayer {
  uid: string;
  displayName: string;
  photoURL: string;
  card: BingoCard;
  hasWon: boolean;
  ready: boolean;
  disconnected?: boolean;
  joinedAt?: Timestamp | null;
}

export interface GameWinner {
  uid: string;
  displayName: string;
}

export interface GameDocument {
  gameId: string;
  partyCode: string;
  hostId: string;
  hostName: string;
  hostSubnet: string | null;
  status: GameStatus;
  settings: GameSettings;
  players: Record<string, GamePlayer>;
  calledNumbers: number[];
  currentNumber: number | null;
  turnOrder: string[];
  currentTurnUid: string | null;
  turnDeadline: number | null;
  winners: GameWinner[];
  startedAt?: Timestamp | null;
  finishedAt?: Timestamp | null;
  createdAt?: Timestamp | null;
}

export interface InviteDocument {
  inviteId: string;
  gameId: string;
  fromUid: string;
  fromName: string;
  toUid: string;
  status: InviteStatus;
  createdAt?: Timestamp | null;
}
