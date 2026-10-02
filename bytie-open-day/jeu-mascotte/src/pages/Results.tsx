import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { useShell } from "../store/shellStore";
import { fetchAIAnalysis } from "../services/api";

/** Langue du commentaire généré par Gemini : "en" (interface actuelle) ou "fr" */
const AI_LANGUAGE: "en" | "fr" = "en";

// Palette: blue -> indigo -> violet -> mauve
const PALETTE = {
  blue: "#3b82f6",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  mauve: "#c084fc",
  mauveLight: "#e9d5ff",
};

const GAME_GRADIENTS: Record<string, [string, string]> = {
  zoom: [PALETTE.blue, PALETTE.indigo],
  connections: [PALETTE.indigo, PALETTE.violet],
  timeline: [PALETTE.violet, PALETTE.mauveLight],
};

const DONUT_SIZE = 128;
const DONUT_STROKE = 12;

function DonutChart({
  id,
  score,
  gradient,
  delay,
  glow,
}: {
  id: string;
  score: number;
  gradient: [string, string];
  delay: number;
  glow?: boolean;
}) {
  const radius = (DONUT_SIZE - DONUT_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const gradId = `donut-gradient-${id}`;

  return (
    <div
      className="relative mx-auto"
      style={{ width: "clamp(64px, 11vw, 128px)", aspectRatio: "1 / 1" }}
    >
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${gradient[1]}55 0%, transparent 70%)` }}
          animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.95, 1.08, 0.95] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
        className="-rotate-90 transform relative"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
        <circle
          cx={DONUT_SIZE / 2}
          cy={DONUT_SIZE / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth={DONUT_STROKE}
        />
        <motion.circle
          cx={DONUT_SIZE / 2}
          cy={DONUT_SIZE / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={DONUT_STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.5, duration: 0.4 }}
          className="text-xs font-black text-white sm:text-lg md:text-2xl"
        >
          {score}%
        </motion.span>
      </div>
    </div>
  );
}

function IconTrophy({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M7 4h10v3a5 5 0 0 1-5 5 5 5 0 0 1-5-5V4Z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <path d="M7 5H4v1a4 4 0 0 0 4 4M17 5h3v1a4 4 0 0 1-4 4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M12 12v4m-3 4h6m-3-4v4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

function IconBolt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
  );
}

function IconSeed({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 21c4-1 7-4 7-9 0-2.5-1-4.5-3-6-1 2-3 3-5 3-3 0-5-2-6-4-1 3 0 6 2 8-1 3 0 6 5 8Z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTarget({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth={1.6} />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={1.6} />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </svg>
  );
}

function IconReplay({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
    </svg>
  );
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Results() {
  const scores = useGameStore((s) => s.scores);
  const total = useGameStore((s) => s.total());
  const startSession = useGameStore((s) => s.startSession);
  const isLoading = useGameStore((s) => s.isLoading);
  const navigate = useNavigate();
  const say = useShell((s) => s.say);

  const zoomScore = scores.zoom ?? 0;
  const connectionsScore = scores.connections ?? 0;
  const timelineScore = scores.timeline ?? 0;

  const rank = useMemo(() => {
    if (total >= 240) return { title: "PRO MASTER" as const, Icon: IconTrophy };
    if (total >= 150) return { title: "INTERMEDIATE" as const, Icon: IconBolt };
    return { title: "BEGINNER" as const, Icon: IconSeed };
  }, [total]);

  const gameData = useMemo(() => {
    const games = [
      { id: "zoom", name: "Zoom Reveal", score: zoomScore },
      { id: "connections", name: "Connections", score: connectionsScore },
      { id: "timeline", name: "Timeline", score: timelineScore },
    ];
    const best = [...games].sort((a, b) => b.score - a.score)[0];
    const worst = [...games].sort((a, b) => a.score - b.score)[0];
    const accuracy = Math.round((total / 300) * 100);
    return { games, best, worst, accuracy };
  }, [zoomScore, connectionsScore, timelineScore, total]);

  // Analyse de fin de partie : générée par Gemini (via FastAPI) et dite par Bytie dans sa bulle
  useEffect(() => {
    const controller = new AbortController();
    // la bulle précédente est déjà effacée par GameShell au changement de page
    say("comment", "Let me check how you did…", 0);

    fetchAIAnalysis(
      {
        zoom_score: zoomScore,
        connections_score: connectionsScore,
        timeline_score: timelineScore,
        rank_title: rank.title,
        language: AI_LANGUAGE,
      },
      controller.signal,
    )
      // Pastille "AI · Gemini" seulement si le texte vient vraiment de l'IA (pas du commentaire local du serveur)
      .then(({ comment, source }) => say("comment", comment, 0, source === "gemini" ? "AI.ASSISTANT" : undefined))
      .catch(() => {
        if (controller.signal.aborted) return;
        say("comment", `I couldn't reach my AI brain, but you scored ${total}/300. Your best game was ${gameData.best.name}!`, 0);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomScore, connectionsScore, timelineScore, rank.title]);

  const handlePlayAgain = async () => {
    await startSession(); // nouvelle partie tirée au hasard, scores remis à zéro
    if (useGameStore.getState().session) navigate("/play/zoom");
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative mx-auto w-[calc(100%-1rem)] max-w-208 rounded-4xl p-px"
      style={{
        background: `linear-gradient(135deg, ${PALETTE.blue}, ${PALETTE.violet}, ${PALETTE.mauve})`,
        boxShadow: `0 25px 70px -10px rgba(76, 29, 149, 0.55)`,
      }}
    >
      <div
        className="relative flex flex-col gap-10 rounded-[calc(2rem-1px)] px-5 py-7 sm:gap-10 sm:px-8 sm:py-9 md:gap-9 md:px-8 md:py-10"
        style={{
          background: `linear-gradient(165deg, #0f0e2a 0%, #1e1b4b 35%, #3730a3 70%, #5b21b6 100%)`,
        }}
      >
        {/* HEADER */}
        <motion.div variants={item} className="relative flex flex-col gap-6 border-b border-white/15 pb-8 sm:gap-7 sm:pb-10">
          <div className="flex flex-row flex-wrap items-center justify-between gap-4">
            <p className="m-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase leading-4 tracking-[0.14em] text-violet-200/85 sm:text-xs sm:tracking-[0.18em]">
              Performance Overview
            </p>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 14 }}
              className="relative flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full border border-white/20 px-5 py-3 text-[10px] font-black uppercase tracking-wide text-white shadow-lg sm:gap-3 sm:px-7 sm:py-3.5 sm:text-xs sm:tracking-wider"
              style={{
                background: `linear-gradient(120deg, ${PALETTE.indigo}, ${PALETTE.violet})`,
                boxShadow: `0 8px 24px -4px ${PALETTE.violet}99`,
              }}
            >
              <rank.Icon className="h-4 w-4 shrink-0" />
              <span>{rank.title}</span>
            </motion.div>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 py-2 text-center">
            <span
              className="text-6xl font-black leading-none tracking-tight md:text-7xl"
              style={{
                background: `linear-gradient(100deg, #ffffff 0%, ${PALETTE.mauveLight} 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {total}
            </span>
            <span className="text-sm font-bold text-violet-200/70">/ 300 pts</span>
          </div>
        </motion.div>

        {/* THREE COLUMNS */}
        <motion.div variants={item} className="relative grid grid-cols-3 gap-2 py-1 sm:gap-4 sm:py-3">
          {gameData.games.map((game, index) => {
            const isBest = game.id === gameData.best.id && gameData.best.score > 0;
            return (
              <motion.div
                key={game.id}
                variants={item}
                className={`relative flex min-w-0 flex-col items-center gap-5 px-2 py-4 sm:gap-6 sm:px-3 sm:py-5 md:px-4 lg:px-5 ${
                  index < gameData.games.length - 1 ? "border-r border-white/20" : ""
                }`}
              >
                <div className="flex min-h-13 min-w-0 flex-col items-center justify-start gap-2.5 text-center sm:min-h-16">
                  <span className="text-center text-[13px] font-black leading-4 text-white/90 sm:text-sm sm:leading-5 md:text-base">
                    {game.name}
                  </span>
                  {isBest && (
                    <span
                      className="rounded-full border border-white/20 px-2.5 py-1 text-[8px] font-bold uppercase text-white sm:px-3.5 sm:py-1.5 sm:text-[10px]"
                      style={{ background: `linear-gradient(120deg, ${PALETTE.violet}, ${PALETTE.mauve})` }}
                    >
                      <span className="sm:hidden">Best</span>
                      <span className="hidden sm:inline">Best score</span>
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-center gap-4 sm:gap-5">
                  <DonutChart
                    id={game.id}
                    score={game.score}
                    gradient={GAME_GRADIENTS[game.id]}
                    delay={0.3 + index * 0.15}
                    glow={isBest}
                  />
                  <span className="whitespace-nowrap rounded-full bg-white/5 px-3 py-1 font-mono text-[9px] font-extrabold leading-5 text-violet-200/85 sm:text-xs md:text-sm">
                    {game.score} / 100
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* FOOTER */}
        <motion.div
          variants={item}
          className="relative flex flex-row flex-wrap items-center justify-between gap-7 border-t border-white/15 pt-8 sm:gap-10 sm:pt-10"
        >
          <div className="flex items-center gap-4 py-1">
            <IconTarget className="h-6 w-6 shrink-0 text-violet-200" />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-white/65">Overall Accuracy</span>
              <span
                className="text-2xl font-black leading-tight"
                style={{
                  background: `linear-gradient(100deg, ${PALETTE.blue}, ${PALETTE.mauveLight})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {gameData.accuracy}%
              </span>
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAgain}
            disabled={isLoading}
            className="relative flex shrink-0 cursor-pointer items-center gap-2.5 overflow-hidden rounded-full px-9 py-3 text-xs font-black uppercase tracking-wider text-white transition-shadow disabled:cursor-wait disabled:opacity-70"
            style={{
              background: `linear-gradient(120deg, ${PALETTE.blue}, ${PALETTE.indigo}, ${PALETTE.violet})`,
              boxShadow: `0 10px 30px -6px ${PALETTE.violet}aa`,
            }}
          >
            <motion.span
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: "linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent)" }}
              animate={{ x: ["-120%", "120%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            />
            <IconReplay className="relative h-4 w-4" />
            <span className="relative">{isLoading ? "Loading…" : "Play Again"}</span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}