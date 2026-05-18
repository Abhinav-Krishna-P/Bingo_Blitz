import { HeroSection } from "@/components/landing/HeroSection";

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_85%_55%,#f97316_0%,#c026d3_28%,#7e22ce_55%,#4c1d95_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,200,120,0.35),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(126,34,206,0.5),transparent_50%)]" />
      <HeroSection />
    </div>
  );
}
