import { useEffect, useState } from "react";
import { Navigate, useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import GameFrame from "./Gameframe";
import { useGameStore } from "../store/gameStore";
import { useShell } from "../store/shellStore";

const INTRO_MS = 2600;

const TITLES: Record<string, string> = {
  zoom: "Zoom Reveal",
  connections: "Connections",
  timeline: "Timeline",
  results: "Your results",
};

/** Carte de présentation affichée entre chaque jeu (pas pour les résultats). */
const INTROS: Record<string, { step: number; rule: string; bytie: string }> = {
  zoom: {
    step: 1,
    rule: "Guess the logo while it zooms out. The sooner you find it, the more points you get!",
    bytie: "Let's go! Guess the logos as they zoom out.",
  },
  connections: {
    step: 2,
    rule: "Find four groups of four related words. Four mistakes and it's over!",
    bytie: "Nice work! Now find the four hidden groups.",
  },
  timeline: {
    step: 3,
    rule: "Put the events in chronological order. Three rounds, 45 seconds each.",
    bytie: "Time travel! Oldest event first.",
  },
};
const TOTAL_GAMES = Object.keys(INTROS).length;

function FrozenOutlet() {
  const outlet = useOutlet();
  const [frozen] = useState(outlet);
  return frozen;
}

function IntroCard({ step, title, rule, onSkip }: { step: number; title: string; rule: string; onSkip: () => void }) {
  return (
    <motion.div
      onClick={onSkip}
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.12 }}
      transition={{ type: "spring", stiffness: 160, damping: 16 }}
      className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-5 text-center"
    >
      {/* Progression : 1 - 2 - 3 */}
      <div className="flex items-center gap-2" aria-label={`Game ${step} of ${TOTAL_GAMES}`}>
        {Array.from({ length: TOTAL_GAMES }, (_, i) => (
          <motion.span
            key={i}
            initial={{ scaleX: 0.4, opacity: 0.4 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            style={{ width: 44, height: 8, borderRadius: 4, background: i < step ? "#FFFFFF" : "rgba(255,255,255,0.3)" }}
          />
        ))}
      </div>

      <p className="m-0 font-extrabold text-white/90" style={{ letterSpacing: "0.08em" }}>
        GAME {step} / {TOTAL_GAMES}
      </p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="m-0 font-extrabold"
        style={{
          fontFamily: '"Baloo 2", "Nunito", system-ui, sans-serif',
          fontSize: "clamp(3rem, 8vw, 5.5rem)",
          lineHeight: 1,
          paddingBottom: "0.1em",
          background: "linear-gradient(100deg, #ffffff 0%, #dbeafe 45%, #ddd6fe 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 4px 12px rgba(49,46,129,0.55))",
        }}
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="m-0 max-w-md font-bold text-white"
        style={{
          padding: "14px 22px",
          borderRadius: 24,
          fontSize: "1.15rem",
          lineHeight: 1.5,
          border: "1.5px solid rgba(255,255,255,0.55)",
          background: "rgba(255,205,255,0.16)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {rule}
      </motion.p>

      {/* Barre qui se remplit : le jeu démarre quand elle est pleine (ou au clic) */}
      <div style={{ width: "min(16rem, 60vw)", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: INTRO_MS / 1000, ease: "linear" }}
          style={{ height: "100%", background: "#FFFFFF" }}
        />
      </div>
      <p className="m-0 text-sm font-bold text-white/70">Tap to start</p>
    </motion.div>
  );
}

export default function GameShell() {
  const session = useGameStore((s) => s.session);
  const { bubble, thinking, hud, clear, setHud, say } = useShell();
  const { pathname } = useLocation();
  const key = pathname.split("/")[2] ?? "";

  const intro = INTROS[key];
  const [introducedKey, setIntroducedKey] = useState("");
  const showIntro = !!intro && introducedKey !== key;

 
  useEffect(() => {
    clear();
    setHud(null);
    if (intro) say("comment", intro.bytie, INTRO_MS);
   
  }, [key]);

  
  useEffect(() => {
    if (!showIntro) return;
    const id = setTimeout(() => setIntroducedKey(key), INTRO_MS);
    return () => clearTimeout(id);
  }, [showIntro, key]);

  
  if (!session) return <Navigate to="/" replace />;

  return (
    <GameFrame title={TITLES[key]} headerRight={hud} bubble={bubble} isThinking={thinking} panel>
      
      <AnimatePresence mode="wait">
        {showIntro && intro ? (
          <motion.div key={`intro-${key}`} className="flex flex-1 flex-col" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <IntroCard step={intro.step} title={TITLES[key]} rule={intro.rule} onSkip={() => setIntroducedKey(key)} />
          </motion.div>
        ) : (
          <motion.div
            key={`game-${key}`}
            className="flex flex-1 flex-col"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <FrozenOutlet />
          </motion.div>
        )}
      </AnimatePresence>
    </GameFrame>
  );
}