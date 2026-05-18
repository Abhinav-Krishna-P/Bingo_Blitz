import * as SliderPrimitive from "@radix-ui/react-slider";

export function Slider(props: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root className="relative flex w-full touch-none select-none items-center" {...props}>
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-black/8">
        <SliderPrimitive.Range className="absolute h-full bg-[#b3001b]" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-[#b3001b]/40 bg-white shadow-[0_0_16px_rgba(179,0,27,0.4)]" />
    </SliderPrimitive.Root>
  );
}
