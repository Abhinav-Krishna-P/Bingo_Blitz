import { DoorOpen } from "lucide-react";

export function JoinPanel({
  disabled,
  partyCode,
  onPartyCodeChange,
  onJoinByCode,
}: {
  disabled: boolean;
  partyCode: string;
  onPartyCodeChange: (value: string) => void;
  onJoinByCode: () => void;
}) {
  return (
    <section className="relative rounded-[28px] border border-pink-300/35 bg-[#3b1175]/55 p-7 shadow-[0_18px_50px_rgba(20,8,50,0.45)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/8" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-white/60">Join With Code</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Join A Game</h2>
        </div>
        <DoorOpen className="h-9 w-9 text-[#fbbf24]" />
      </div>

      <p className="relative mt-5 text-sm leading-7 text-white/75">
        Ask the host for their party code, enter it below, and you'll be dropped straight into the lobby.
      </p>

      <div className="relative mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.28em] text-white/55">Party Code</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            disabled={disabled}
            value={partyCode}
            maxLength={6}
            placeholder="Enter 6-character code"
            onChange={(event) => onPartyCodeChange(event.target.value.toUpperCase())}
            className="h-11 w-full rounded-full border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/45 outline-none focus:border-pink-300/60 focus:bg-white/15"
          />
          <button
            type="button"
            disabled={disabled || partyCode.trim().length < 6}
            onClick={onJoinByCode}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#ec4899] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(236,72,153,0.45)] transition hover:-translate-y-0.5 hover:bg-[#f472b6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Join Code
          </button>
        </div>
      </div>
    </section>
  );
}
