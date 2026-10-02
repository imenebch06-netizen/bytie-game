import { useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Mascot from "../components/Bytie";
import WaveBorder from "../components/WaveBorder";
import SpeechBubble, { type BubbleMessage } from "../components/Speechbubble";

interface GameFrameProps {
  children: ReactNode;
  bubble?: BubbleMessage | null;
  isThinking?: boolean;
  robotWaving?: boolean;
  title?: string;
  headerRight?: ReactNode;
  panel?: boolean;
  waves?: {
    topHeight?: string;
    bottomHeight?: string;
    duration?: number;
    colors?: [string, string, string];
  };
}

const ROBOT_W = "clamp(11rem, 18vw, 16rem)";
const ROBOT_TILT = 18;

const glass: CSSProperties = {
  background: "transparent",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
};

export default function GameFrame({
  children,
  bubble,
  isThinking = false,
  robotWaving = false,
  title,
  headerRight,
  panel = false,
  waves,
}: GameFrameProps) {
  const [talking, setTalking] = useState(false);
  const isResults = title === "Your results";

  return (
    <main
      className="relative min-h-dvh w-full overflow-x-hidden overflow-y-clip"
      style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 45%, #8b5cf6 100%)", "--rw": ROBOT_W } as CSSProperties}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{ left: "-8rem", top: "25%", width: "28rem", height: "28rem", background: "rgba(191,219,254,0.55)", filter: "blur(80px)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full"
        style={{ right: "-6rem", bottom: "2.5rem", width: "24rem", height: "24rem", background: "rgba(196,181,253,0.55)", filter: "blur(80px)" }}
      />

      <WaveBorder position="top" height={waves?.topHeight ?? "clamp(64px, 9vw, 112px)"} duration={waves?.duration ?? 24} colors={waves?.colors} />
      <WaveBorder position="bottom" height={waves?.bottomHeight ?? "clamp(68px, 9vw, 120px)"} duration={(waves?.duration ?? 24) + 4} colors={waves?.colors} />

      <div
        className={`relative z-10 mx-auto flex w-full max-w-6xl flex-col ${
          isResults
            ? "min-h-svh px-5 pb-16 pt-24 sm:px-8 md:px-12 md:pb-20 md:pt-28 lg:px-16"
            : "min-h-screen pl-4 pr-4 pb-[calc(var(--rw)*1.375*0.62)] pt-14 md:pr-10 md:pb-[calc(var(--rw)*0.35)] md:pt-20 md:pl-[calc(var(--rw)*0.85_+_2.5rem)]"
        }`}
      >
        {(title || headerRight) && (
          <motion.header
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex shrink-0 items-center justify-between gap-4 md:mb-8"
          >
            <h2
              className="m-0 text-3xl font-extrabold md:text-5xl"
              style={{
                fontFamily: '"Baloo 2", "Nunito", system-ui, sans-serif',
                background: "linear-gradient(100deg, #ffffff 0%, #dbeafe 45%, #ddd6fe 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 4px 10px rgba(49,46,129,0.5))",
                lineHeight: 1.05,
              }}
            >
              {title}
            </h2>
            {headerRight && (
              <div className="font-extrabold" style={{ ...glass, padding: "8px 20px", borderRadius: 999, color: "#ffffff" }}>
                {headerRight}
              </div>
            )}
          </motion.header>
        )}

        {isResults ? (
          <div className="flex flex-1 flex-col items-center gap-6 py-2 md:flex-row md:items-center md:justify-center md:gap-8 lg:gap-12">
            {/* Bytie et sa bulle (texte généré par l'IA) à gauche */}
            <div className="flex w-full shrink-0 flex-col items-center gap-4 md:w-72 lg:w-80">
              <div className="relative w-full">
                <AnimatePresence mode="wait">
                  {bubble && (
                    <SpeechBubble
                      key={`${bubble.type}-${bubble.text}`}
                      type={bubble.type}
                      text={bubble.text}
                      badge={bubble.badge}
                      tailPosition="center"
                      speed={16}
                      onTypingChange={setTalking}
                    />
                  )}
                </AnimatePresence>
              </div>

              <div style={{ width: "clamp(9rem, 20vw, 14rem)", aspectRatio: "400 / 550" }}>
                <Mascot size="100%" isWaving={robotWaving} isThinking={isThinking && !bubble} isTalking={talking} />
              </div>
            </div>

            {/* Statistiques à droite */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="w-full min-w-0 flex-1"
            >
              {children}
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-1 flex-col"
            style={panel ? { ...glass, borderRadius: 28, padding: "1.25rem", boxShadow: "0 18px 40px rgba(49,46,129,0.3)" } : undefined}
          >
            {children}
          </motion.div>
        )}
      </div>

      {!isResults && (
        <>
          <motion.div
            layoutId="robot-container"
            initial={false}
            animate={{ rotate: ROBOT_TILT, x: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 110, damping: 16 }}
            className="absolute z-18"
            style={{
              width: "var(--rw)",
              aspectRatio: "400 / 550",
              left: "clamp(-5rem, -5vw, 4rem)",
              bottom: "calc(var(--rw) * -0.01)",
              transformOrigin: "bottom left",
            }}
          >
            <Mascot size="180%" isWaving={robotWaving} isThinking={isThinking && !bubble} isTalking={talking} />
          </motion.div>

          <div
            className="absolute z-30 transition-all duration-500 ease-out"
            style={{
              left: "calc(var(--rw) * 0.8)",
              bottom: "calc(var(--rw)*1.8) ",
              width: "min(80rem, calc(180% - var(--rw) - 1rem))",
              maxWidth: "min(30rem, 180%)",
            }}
          >
            <AnimatePresence mode="wait">
              {bubble && (
                <SpeechBubble
                  key={`${bubble.type}-${bubble.text}`}
                  type={bubble.type}
                  text={bubble.text}
                  badge={bubble.badge}
                  onTypingChange={setTalking}
                />
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </main>
  );
}