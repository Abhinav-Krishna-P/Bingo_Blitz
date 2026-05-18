import { RadioTower } from "lucide-react";

export function HostPanel({
  disabled,
  onHost,
  helperText,
}: {
  disabled: boolean;
  onHost: () => void;
  helperText?: string;
}) {
  return (
    <section className="relative rounded-[28px] border border-pink-300/35 bg-[#3b1175]/55 p-7 shadow-[0_18px_50px_rgba(20,8,50,0.45)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/8" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-white/60">Command Console</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Host A Game</h2>
        </div>
        <RadioTower className="h-9 w-9 text-[#fbbf24]" />
      </div>
      <p className="relative mt-5 max-w-md text-sm leading-7 text-white/75">
        Create a private Bingo session and share the generated party code so other players can join directly.
      </p>
      {helperText ? <p className="relative mt-4 text-sm text-[#fde68a]">{helperText}</p> : null}
      <button
        type="button"
        disabled={disabled}
        onClick={onHost}
        className="relative mt-8 inline-flex items-center justify-center rounded-full bg-[#ec4899] px-7 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(236,72,153,0.5)] transition hover:-translate-y-0.5 hover:bg-[#f472b6] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Host Game
      </button>
    </section>
  );
}
