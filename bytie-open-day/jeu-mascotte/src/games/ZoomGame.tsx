import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ZOOM_STAGE_SCALES } from "../data/gamesData";
import { SCORING } from "../config/scoring.config";
import { scoreZoomGame, scoreZoomRound } from "../logic/scoring";
import { nextPath, useGameStore } from "../store/gameStore";
import { useShell } from "../store/shellStore";

const LAST_STAGE = ZOOM_STAGE_SCALES.length - 1;
const REVEAL_MS = 1800;

const WRONG_LINES = ["Not quite. Look closer!", "Nope, try another one.", "Hmm, that's not it."];
const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];

export default function ZoomGame() {
  const session = useGameStore((s) => s.session);
  const startSession = useGameStore((s) => s.startSession);
  const error = useGameStore((s) => s.error);
  const finishGame = useGameStore((s) => s.finishGame);
  const { say, clear, setHud } = useShell();
  const navigate = useNavigate();

  const [roundIdx, setRoundIdx] = useState(0);
  const [stage, setStage] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [points, setPoints] = useState<number[]>([]);
  const [status, setStatus] = useState<"playing" | "revealed">("playing");

  // 1. Charger la session si elle n'est pas disponible
  useEffect(() => {
    if (!session && !error) {
      startSession();
    }
  }, [session, error, startSession]);

  const rounds = session?.zoom;
  const round = rounds ? rounds[roundIdx] : null;
  const totalPoints = points.reduce((a, b) => a + b, 0);

  // 2. En-tête : progression + points
  useEffect(() => {
    if (rounds) {
      setHud(`Round ${roundIdx + 1}/${rounds.length} · ${totalPoints} pts`);
    }
  }, [roundIdx, totalPoints, rounds, setHud]);

  // 3. Horloge du jeu : zoom progressif
  useEffect(() => {
    if (status !== "playing" || !round) return;
    const id = setTimeout(() => {
      if (stage < LAST_STAGE) setStage(stage + 1);
      else finishRound(null);
    }, SCORING.zoom.stageDurationMs);
    return () => clearTimeout(id);
  }, [stage, roundIdx, status, round]);

  // 4. Après la révélation : round suivant ou fin de partie
  useEffect(() => {
    if (status !== "revealed" || !rounds) return;
    const id = setTimeout(() => {
      if (roundIdx === rounds.length - 1) {
        finishGame("zoom", scoreZoomGame(points));
        navigate(nextPath("zoom"));
      } else {
        clear();
        setRoundIdx((idx) => idx + 1);
        setStage(0);
        setWrong([]);
        setHintsUsed(0);
        setStatus("playing");
      }
    }, REVEAL_MS);
    return () => clearTimeout(id);
  }, [status, roundIdx, rounds, points, finishGame, navigate, clear]);

  function finishRound(answeredStage: number | null) {
    if (!round) return;
    const pts = scoreZoomRound(answeredStage, wrong.length);
    setPoints((p) => [...p, pts]);
    setStatus("revealed");
    if (answeredStage === null) say("comment", `Time's up! It was ${round.answer}.`, REVEAL_MS);
    else if (answeredStage <= 1) say("comment", `Wow, ${round.answer} in a flash! +${pts}`, REVEAL_MS);
    else say("comment", `Yes, ${round.answer}! +${pts}`, REVEAL_MS);
  }

  function guess(option: string) {
    if (status !== "playing" || !round || wrong.includes(option)) return;
    if (option === round.answer) finishRound(stage);
    else {
      setWrong((w) => [...w, option]);
      say("comment", pick(WRONG_LINES), 2500);
    }
  }

  function askHint() {
    if (status !== "playing" || !round) return;
    say("hint", round.hints[Math.min(hintsUsed, round.hints.length - 1)], 9000);
    setHintsUsed((n) => n + 1);
  }

  //  GARDE SÉCURITÉ : Affichage d'un loader si la session ou le round n'est pas prêt
  if (error && !session) {
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 px-6 text-center text-white">
        <p className="text-xl font-bold">Impossible de charger la partie</p>
        <p className="max-w-md text-sm opacity-80">{error}</p>
        <button onClick={() => startSession()} className="rounded-full bg-white px-6 py-2 font-extrabold text-indigo-700">
          Réessayer
        </button>
      </div>
    );
  }

  if (!session || !rounds || !round) {
    return (
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 text-white">
        <p className="text-xl font-bold animate-pulse">Chargement de la partie...</p>
      </div>
    );
  }

  const shownStage = status === "revealed" ? LAST_STAGE : stage;

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={round.id}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="flex w-full flex-col items-center gap-6"
        >
          {/* Conteneur de l'image */}
          <div
            style={{
              width: "min(20rem, 70vw)",
              aspectRatio: "1 / 1",
              overflow: "hidden",
              borderRadius: 28,
              background: "#FFFFFF",
              border: "3px solid #FFFFFF",
              boxShadow: "0 18px 40px rgba(49,46,129,0.4)",
            }}
          >
            <motion.img
              key={round.id}
              src={round.image}
              alt="Guess the logo"
              draggable={false}
              initial={{ scale: ZOOM_STAGE_SCALES[0] }}
              animate={{ scale: ZOOM_STAGE_SCALES[shownStage] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transformOrigin: `${round.focus.x}% ${round.focus.y}%`,
              }}
            />
          </div>

          {/* Indicateur des étapes de dézoom */}
          <div className="flex gap-2" aria-hidden="true">
            {ZOOM_STAGE_SCALES.map((_, i) => (
              <span
                key={i}
                style={{
                  width: 28,
                  height: 6,
                  borderRadius: 3,
                  background: i <= shownStage ? "#FFFFFF" : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>

          {/* Les 4 propositions */}
          <div className="grid w-full max-w-xl grid-cols-2 gap-3">
            {round.options.map((opt:any) => {
              const isWrong = wrong.includes(opt);
              const isRight = status === "revealed" && opt === round.answer;
              return (
                <motion.button
                  key={opt}
                  whileHover={{ scale: isWrong ? 1 : 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={isWrong || status === "revealed"}
                  onClick={() => guess(opt)}
                  style={{
                    padding: "14px 18px",
                    borderRadius: 999,
                    border: "2px solid #FFFFFF",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    cursor: isWrong ? "not-allowed" : "pointer",
                    color: isRight ? "#FFFFFF" : isWrong ? "rgba(255,255,255,0.55)" : "#4338CA",
                    background: isRight
                      ? "linear-gradient(135deg, #3B82F6, #8B5CF6)"
                      : isWrong
                        ? "rgba(255,255,255,0.12)"
                        : "linear-gradient(180deg, #FFFFFF, #E0E7FF)",
                    boxShadow: isWrong ? "none" : "0 5px 0 #A5B4FC",
                    textDecoration: isWrong ? "line-through" : "none",
                  }}
                >
                  {opt}
                </motion.button>
              );
            })}
          </div>

          <button
            onClick={askHint}
            disabled={status !== "playing"}
            className="font-extrabold text-white"
            style={{
              padding: "8px 20px",
              borderRadius: 999,
              border: "1.5px solid rgba(255,255,255,0.55)",
              background: "rgba(255,255,255,0.16)",
            }}
          >
            Need a hint?
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}