import { useEffect, useState } from "react";
import { subscribeToGame } from "@/firebase/game";
import type { GameDocument } from "@/types/game";

export function useGameSubscription(gameId?: string) {
  const [game, setGame] = useState<GameDocument | null>(null);
  const [loading, setLoading] = useState(Boolean(gameId));

  useEffect(() => {
    if (!gameId) {
      setGame(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    return subscribeToGame(gameId, (nextGame) => {
      setGame(nextGame);
      setLoading(false);
    });
  }, [gameId]);

  return { game, loading };
}
