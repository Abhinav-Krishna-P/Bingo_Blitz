import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-black/10 bg-black/4 px-4 py-3 text-sm text-[#2a1f15] outline-none placeholder:text-[#7a6a59] focus:border-[#b3001b]/40 focus:bg-black/5",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
