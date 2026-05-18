import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Smile, Sparkles, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";

const BINGO_HEADER = ["B", "I", "N", "G", "O"] as const;

function FeaturePill({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)] backdrop-blur-md">
        {icon}
      </div>
      <p className="mt-3 text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 max-w-[10rem] text-xs leading-snug text-white/80">{description}</p>
    </div>
  );
}

function BingoCardArt({
  palette,
  numbers,
  withFree,
  rotation,
  className,
}: {
  palette: { frame: string; header: string };
  numbers: (number | "FREE")[][];
  withFree: boolean;
  rotation: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute rounded-3xl p-3 shadow-[0_24px_60px_rgba(20,8,50,0.45)] ${palette.frame} ${className ?? ""}`}
      style={{ transform: rotation }}
    >
      <div className={`grid grid-cols-5 gap-1 rounded-t-2xl ${palette.header} p-1.5`}>
        {BINGO_HEADER.map((letter) => (
          <div key={letter} className="flex h-8 items-center justify-center font-bingo text-base text-white drop-shadow">
            {letter}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1 rounded-b-2xl bg-[#fffaf0] p-1.5">
        {numbers.flat().map((value, index) => {
          const isFree = value === "FREE";
          return (
            <div
              key={index}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold sm:h-10 sm:w-10 sm:text-sm ${
                isFree && withFree
                  ? "bg-[#e91e63] text-white"
                  : "bg-white text-[#231a45]"
              }`}
            >
              {value}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FloatingBall({
  className,
  label,
  letter,
  color,
}: {
  className?: string;
  label: number;
  letter?: string;
  color: string;
}) {
  return (
    <div
      className={`absolute flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${color} text-white shadow-[0_14px_32px_rgba(0,0,0,0.35)] ring-4 ring-white/70 sm:h-20 sm:w-20 ${className ?? ""}`}
    >
      <div className="flex flex-col items-center leading-none">
        {letter ? <span className="font-bingo text-xs">{letter}</span> : null}
        <span className="font-bingo text-2xl sm:text-3xl">{label}</span>
      </div>
    </div>
  );
}

const BLUE_CARD: (number | "FREE")[][] = [
  [12, 18, 41, 47, 61],
  [7, 26, 39, 54, 70],
  [4, 22, "FREE", 56, 65],
  [9, 28, 35, 50, 73],
  [11, 24, 44, 58, 67],
];

const PINK_CARD: (number | "FREE")[][] = [
  [5, 17, 31, 46, 63],
  [9, 20, "FREE", 48, 66],
  [3, 22, 36, 52, 75],
  [8, 19, 37, 53, 69],
  [14, 27, 33, 49, 72],
];

export function HeroSection() {
  const { user, firebaseReady } = useAuth();

  return (
    <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <Star className="absolute -top-4 left-12 h-8 w-8 fill-[#fbbf24] text-[#fbbf24] drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]" />
        <h1 className="font-bingo text-white">
          <span className="block text-[clamp(3.5rem,9vw,7rem)] leading-[0.95] drop-shadow-[0_6px_0_rgba(0,0,0,0.18)]">
            Bingo
          </span>
          <span className="-mt-2 block text-[clamp(3rem,8vw,6rem)] leading-[0.95] text-[#fbbf24] drop-shadow-[0_6px_0_rgba(0,0,0,0.22)]">
            Blitz
          </span>
        </h1>

        <p className="mt-6 text-2xl font-semibold text-white sm:text-3xl">
          More players. <span className="text-[#fbbf24]">More fun.</span>
        </p>

        <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-8 sm:max-w-md">
          <FeaturePill
            icon={<Users className="h-5 w-5" />}
            title="2-6 Players"
            description="Play with friends and family"
          />
          <FeaturePill
            icon={<Star className="h-5 w-5" />}
            title="Attractive UI"
            description="Clean, colorful and easy to use"
          />
          <FeaturePill
            icon={<Smile className="h-5 w-5" />}
            title="More Players"
            description="The more, the merrier!"
          />
        </div>

        <div className="mt-10">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-lg font-semibold text-[#1f1147] shadow-[0_12px_30px_rgba(76,29,149,0.45)] transition hover:-translate-y-0.5"
            >
              Enter Game Room
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <GoogleSignInButton />
          )}
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-white/75">
          <ShieldCheck className="h-4 w-4" />
          Secure. Fast. Simple.
        </div>

        {!firebaseReady ? (
          <p className="mt-4 max-w-md text-xs text-[#fde68a]">
            Firebase is not configured yet. Add the values from <code>.env.example</code> before sign-in is available.
          </p>
        ) : null}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative hidden h-[460px] w-full lg:block"
        aria-hidden="true"
      >
        <div className="absolute right-12 top-12 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,200,120,0.55),transparent_70%)] blur-2xl" />

        <Sparkles className="absolute right-6 top-6 h-7 w-7 text-[#fbbf24]" />
        <Star className="absolute left-8 top-24 h-6 w-6 fill-[#fbbf24] text-[#fbbf24]" />

        <BingoCardArt
          palette={{ frame: "bg-[#3b82f6]", header: "bg-[#1d4ed8]" }}
          numbers={BLUE_CARD}
          withFree={false}
          rotation="rotate(-4deg)"
          className="right-16 top-8 h-fit w-[280px]"
        />

        <BingoCardArt
          palette={{ frame: "bg-[#ec4899]", header: "bg-[#be185d]" }}
          numbers={PINK_CARD}
          withFree
          rotation="rotate(3deg)"
          className="left-2 top-32 h-fit w-[300px]"
        />

        <FloatingBall
          className="right-2 -top-2"
          label={37}
          letter="N"
          color="from-[#60a5fa] to-[#2563eb]"
        />
        <FloatingBall
          className="right-0 top-44"
          label={17}
          color="from-[#a78bfa] to-[#7c3aed]"
        />
        <FloatingBall
          className="-left-4 top-4"
          label={8}
          letter="B"
          color="from-[#fdba74] to-[#ea580c]"
        />
        <FloatingBall
          className="bottom-2 right-10"
          label={22}
          color="from-[#86efac] to-[#16a34a]"
        />
      </motion.div>
    </div>
  );
}
