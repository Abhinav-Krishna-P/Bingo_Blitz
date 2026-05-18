import { createContext, useCallback, useMemo, useReducer, type Dispatch, type ReactNode } from "react";
import { subscribeToGame } from "@/firebase/game";
import type { GameDocument } from "@/types/game";

interface GameState {
  game: GameDocument | null;
  gameId: string | null;
  loading: boolean;
}

type GameAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_GAME"; payload: { gameId: string; game: GameDocument | null } }
  | { type: "CLEAR_GAME" };

const initialState: GameState = {
  game: null,
  gameId: null,
  loading: false,
};

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_GAME":
      return { gameId: action.payload.gameId, game: action.payload.game, loading: false };
    case "CLEAR_GAME":
      return initialState;
    default:
      return state;
  }
}

interface GameContextValue extends GameState {
  dispatch: Dispatch<GameAction>;
  watchGame: (gameId: string) => () => void;
}

export const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const watchGame = useCallback((gameId: string) => {
    dispatch({ type: "SET_LOADING", payload: true });
    const unsubscribe = subscribeToGame(gameId, (game) => {
      dispatch({ type: "SET_GAME", payload: { gameId, game } });
    });

    return () => {
      unsubscribe();
      dispatch({ type: "CLEAR_GAME" });
    };
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      ...state,
      dispatch,
      watchGame,
    }),
    [state, watchGame],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
