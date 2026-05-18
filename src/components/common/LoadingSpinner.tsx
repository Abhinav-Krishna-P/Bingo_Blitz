import { cn } from "@/lib/utils";

export function LoadingSpinner({
  label = "Loading...",
  fullScreen = false,
}: {
  label?: string;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen ? "min-h-screen bg-[#f4ead4]" : "min-h-[12rem]",
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-14 w-14 rounded-full border-2 border-black/10 border-t-[#b3001b] animate-spin" />
        <p className="text-sm text-[#7a6a59]">{label}</p>
      </div>
    </div>
  );
}
