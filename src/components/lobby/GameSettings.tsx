import { useEffect, useState } from "react";
import type { GameSettings as Settings } from "@/types/game";
import { Slider } from "@/components/ui/slider";
import { BOARD_SIZE_OPTIONS } from "@/utils/bingo";

export function GameSettings({
  settings,
  isHost,
  onSave,
}: {
  settings: Settings;
  isHost: boolean;
  onSave: (next: Settings) => void;
}) {
  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  return (
    <section className="relative rounded-[28px] border border-pink-300/35 bg-[#3b1175]/55 p-7 shadow-[0_18px_50px_rgba(20,8,50,0.45)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/8" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-white/60">Lobby Controls</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Game Settings</h2>
        </div>
        {isHost ? (
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="rounded-full bg-[#ec4899] px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(236,72,153,0.45)] transition hover:-translate-y-0.5 hover:bg-[#f472b6]"
          >
            Save
          </button>
        ) : null}
      </div>

      <div className="relative mt-6 grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm text-white/70">
          Max Players
          <input
            disabled={!isHost}
            type="number"
            min={2}
            max={10}
            value={draft.maxPlayers}
            onChange={(event) =>
              setDraft((value) => ({ ...value, maxPlayers: Number(event.target.value) }))
            }
            className="h-11 w-full rounded-xl border border-white/20 bg-white/8 px-4 text-sm text-white outline-none focus:border-pink-300/60 focus:bg-white/15 disabled:opacity-60"
          />
        </label>
        <label className="space-y-2 text-sm text-white/70">
          Min Players
          <input
            disabled={!isHost}
            type="number"
            min={2}
            max={6}
            value={draft.minPlayers}
            onChange={(event) =>
              setDraft((value) => ({ ...value, minPlayers: Number(event.target.value) }))
            }
            className="h-11 w-full rounded-xl border border-white/20 bg-white/8 px-4 text-sm text-white outline-none focus:border-pink-300/60 focus:bg-white/15 disabled:opacity-60"
          />
        </label>

        <div className="md:col-span-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.28em] text-white/60">Board Size</p>
          <p className="mt-1 text-xs text-white/55">
            Larger boards use more numbers (size × size) and take longer to fill.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {BOARD_SIZE_OPTIONS.map((size) => {
              const isActive = draft.boardSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  disabled={!isHost}
                  onClick={() => setDraft((current) => ({ ...current, boardSize: size }))}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isActive
                      ? "bg-[#ec4899] text-white shadow-[0_8px_18px_rgba(236,72,153,0.45)]"
                      : "border border-white/20 bg-white/8 text-white hover:bg-white/15"
                  }`}
                >
                  {size}×{size}
                  <span className="ml-2 text-xs opacity-80">({size * size})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.28em] text-white/60">Turn Duration</p>
          <p className="mt-1 text-xs text-white/55">
            Each player has this much time to pick a number. On timeout, a number is picked for them.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <Slider
              disabled={!isHost}
              min={5}
              max={20}
              step={1}
              value={[draft.turnDurationSeconds]}
              onValueChange={([value]) =>
                setDraft((current) => ({ ...current, turnDurationSeconds: value }))
              }
            />
            <span className="text-sm font-semibold text-white">{draft.turnDurationSeconds}s</span>
          </div>
        </div>
      </div>
    </section>
  );
}
