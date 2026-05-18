# Bingo Blitz

A real-time multiplayer Bingo web app. The host creates a private room, shares a 6-character party code, and other players join from any device. Players take turns picking numbers from their own card — every pick crosses the same number on every player's board. First to spell **BINGO** by completing 5 distinct lines and slamming the buzzer wins. Up to 3 podium positions per round.

Built with **React + TypeScript + Vite + Tailwind**, backed by **Firebase Auth + Firestore + Hosting**.

---

## Game rules

- Each player gets a randomized N×N card (N = 5, 6, or 7) containing every number from 1 to N² exactly once. The host picks the board size in the lobby.
- Turns rotate in a fixed random order. The active player has **10 seconds** (configurable 5–20s) to pick an uncrossed number from their own board.
- The picked number is announced and crossed off on **every player's** card.
- If the timer runs out, the turn is **skipped** — no number is picked. The next player gets their turn.
- Each row, column, or diagonal that becomes fully crossed earns one letter of **BINGO** for that player.
- When you have all 5 letters, the **BINGO!** buzzer at the top of the screen lights up. Click it to claim a podium spot. **Fastest finger wins** — there are no draws.
- The game keeps running until **3 winners** are declared (1st, 2nd, 3rd) or no more eligible players remain.
- The host can **Abort Game** at any time (with confirmation) — all players are kicked back to the dashboard.

---

## Tech stack

| Layer | Tech |
|---|---|
| Build & dev | Vite 8 |
| UI | React 19, Tailwind CSS 4, Radix UI primitives, Framer Motion, lucide-react |
| State | Firestore real-time listeners + React hooks |
| Auth | Firebase Auth (Google provider) |
| Hosting | Firebase Hosting |
| Routing | react-router-dom |

---

## Project structure

```
src/
├── app/routes.tsx              Route definitions + protected-route wrapper
├── pages/
│   ├── LandingPage.tsx         Sign-in screen
│   ├── DashboardPage.tsx       Host a game / join with party code
│   ├── LobbyPage.tsx           Waiting room — settings, players, start
│   └── GamePage.tsx            Active board, buzzer, podium
├── components/
│   ├── common/                 AppShell, Navbar, LoadingSpinner
│   ├── landing/                Hero + Google sign-in
│   ├── dashboard/              HostPanel, JoinPanel, PlayerCard
│   ├── lobby/                  GameSettings, PlayerList, InviteNotification
│   ├── game/                   BingoBoard, BingoCell, TurnIndicator,
│   │                           GameTimer, PlayerStatus, WinnerOverlay,
│   │                           CalledNumbers
│   ├── auth/                   GoogleSignInButton
│   └── ui/                     Radix-based button, dialog, dropdown, etc.
├── context/AuthContext.tsx     Auth state + signIn / signOut
├── hooks/
│   ├── useAuth.ts
│   └── useGame.ts              Subscribes to a game doc by id
├── firebase/
│   ├── config.ts               Firebase init from env vars
│   ├── auth.ts                 Sign-in, sign-out, presence registration
│   ├── presence.ts             Online status tracking
│   ├── invites.ts              Invite create / accept / reject
│   └── game.ts                 createGame, joinGame, pickNumber,
│                               claimBingo, autoSkipTurn, abortGame, ...
├── utils/
│   ├── bingo.ts                Card generation, win checking, helpers
│   └── network.ts
├── types/game.ts               Shared types (GameDocument, GamePlayer, ...)
└── index.css                   Tailwind theme tokens + fonts
firestore.rules                 Security rules (host-only settings,
                                player-slot scoping, immutable fields)
firestore.indexes.json
firebase.json                   Hosting + Firestore config
```

---

## Getting started

### 1. Prerequisites

- Node.js 20+ and npm
- A Firebase project with **Authentication (Google provider)**, **Firestore**, and **Hosting** enabled
- Firebase CLI: `npm i -g firebase-tools`

### 2. Install

```bash
git clone <your-fork>
cd "bingo  game"
npm install
```

### 3. Environment

Create a `.env.local` in the project root with your Firebase web-config values:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_MEASUREMENT_ID=     # optional, leave blank if not using Analytics
```

(These are public-by-design — Firebase web config is safe to embed in client code. Real security is enforced via `firestore.rules`.)

### 4. Run locally

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

To test multiplayer locally: open the app in two different browsers (or one normal + one incognito window) and sign in with separate Google accounts. Host in one window, copy the party code, join from the other.

---

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) and build production bundle into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run `tsc --noEmit` only |
| `npm run lint` | ESLint over the project |

---

## Deploying

```bash
# Build
npm run build

# Deploy hosting + Firestore rules + indexes
firebase deploy

# Or piecemeal
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

The Firebase project to deploy into is selected via `firebase use <project-id>` or the `.firebaserc` file.

---

## Firestore security rules

[`firestore.rules`](firestore.rules) enforces:

- **Auth required** for all reads and writes
- **Immutable fields**: `gameId`, `partyCode`, `hostId`, `hostName`, `createdAt` can't be changed after creation
- **Host-only**: settings updates, document deletion (abort)
- **Settings validated**: `maxPlayers ∈ [2..10]`, `minPlayers ≥ 2`, `turnDurationSeconds ∈ [3..60]`, `boardSize ∈ {5, 6, 7}`
- **Player-slot scoping**: a non-host player's writes can only affect their own entry in the `players` map — they can't evict other players or mutate the host's slot
- **Sessions / users**: each user can only write their own document

### Known limitation

Some pieces of game logic — verifying a `pickNumber` was made by `currentTurnUid`, or that a `claimBingo` actually has 5 completed lines — are enforced **only by client-side Firestore transactions in [`src/firebase/game.ts`](src/firebase/game.ts)**. A determined attacker with browser-console access could still mutate `calledNumbers` or `winners` directly. If cheat-resistance becomes important, port those actions into a Cloud Function that owns all game mutations.

---

## Notable design decisions

- **No `FREE` space** — every cell on every card has a number.
- **Auto-mark, no manual mark** — when a number is picked, it's crossed on every board simultaneously. Players never click their own crossed cells.
- **Buzzer is route-independent of turn** — once you complete 5 lines, you can buzz any time, even on someone else's turn. This is what makes the fastest-finger mechanic work.
- **Timeout skips, not auto-picks** — early versions auto-picked a random number on timeout; that has been removed. Lazy players just lose their turn cleanly.
- **Up to 3 podium spots** — game keeps running after the 1st winner until 3 winners are declared or no more eligible players remain.
- **Letters scale with the word, not the board** — `LETTERS_TO_WIN` is fixed at 5 regardless of board size. On larger boards (6×6, 7×7) 5 lines fill faster — that's a deliberate "bigger board = quicker round" trade-off.

---

## License

Private / unlicensed.
