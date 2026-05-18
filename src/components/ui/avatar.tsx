import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

export function Avatar({
  className,
  src,
  fallback,
}: {
  className?: string;
  src?: string | null;
  fallback: string;
}) {
  return (
    <AvatarPrimitive.Root
      className={cn("flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-black/6", className)}
    >
      {src ? <AvatarPrimitive.Image className="h-full w-full object-cover" src={src} alt={fallback} /> : null}
      <AvatarPrimitive.Fallback className="text-xs font-semibold text-[#2a1f15]">
        {fallback.slice(0, 2).toUpperCase()}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
