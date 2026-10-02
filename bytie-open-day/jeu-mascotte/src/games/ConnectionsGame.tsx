import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CONNECTIONS_MAX_MISTAKES, type ConnectionsGroup } from "../data/gamesData";
import { SCORING } from "../config/scoring.config";
import { scoreConnections } from "../logic/scoring";
import { nextPath, useGameStore } from "../store/gameStore";
import { useShell } from "../store/shellStore";

const MAX_HINTS = 2;
const END_DELAY_MS = 2800;
const TIME_LIMIT = SCORING.connections.timeLimitSec;

/* Une teinte par difficulté, toujours dans le bleu / violet */
const DIFF_STYLE: Record<ConnectionsGroup["difficulty"], { bg: string; color: string }> = {
  1: { bg: "#DBEAFE", color: "#1E3A8A" },
  2: { bg: "#C4B5FD", color: "#3B0764" },
  3: { bg: "#818CF8", color: "#FFFFFF" },
  4: { bg: "#6D28D9", color: "#FFFFFF" },
};

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function shuffle<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ConnectionsGame() {
  const initialWords = useGameStore((s) => s.session!.connectionsWords);
  const GROUPS = useGameStore((s) => s.session!.connectionsGroups);
  const finishGame = useGameStore((s) => s.finishGame);
  const { say, setHud } = useShell();
  const navigate = useNavigate();

  const [words, setWords] = useState<string[]>(initialWords);
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<ConnectionsGroup[]>([]);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(TIME_LIMIT);
  const [shaking, setShaking] = useState(false);
  const [status, setStatus] = useState<"playing" | "done">("playing");

  const startRef = useRef(Date.now());
  const endTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(endTimer.current), []);

  /* Chrono : calculé depuis l'heure de départ */
  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => {
      return setTimeLeft(Math.max(0, TIME_LIMIT - Math.floor((Date.now() - startRef.current) / 1000)));
    }, 250);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status === "playing" && timeLeft === 0) endGame("time", solved, mistakes, 0);
  }, [timeLeft]);

  /* En-tête : temps + vies restantes */
  useEffect(() => {
    const lives = "●".repeat(CONNECTIONS_MAX_MISTAKES - mistakes) + "○".repeat(mistakes);
    setHud(`${mmss(timeLeft)} · Lives ${lives}`);
  }, [timeLeft, mistakes, setHud]);

  /* Fin de partie */
  function endGame(reason: "won" | "lives" | "time", found: ConnectionsGroup[], mistakeCount: number, left: number) {
    if (status !== "playing") return;
    setStatus("done");
    setSelected([]);

    const allFound = reason === "won";
    const score = scoreConnections({
      foundGroupPoints: found.reduce((sum, g) => sum + g.points, 0),
      mistakes: mistakeCount,
      timeLeftSec: left,
      allFound,
    });

    if (!allFound) {
      const missing = GROUPS.filter((g) => !found.some((f) => f.id === g.id)).sort((a, b) => a.difficulty - b.difficulty);
      setRevealedIds(missing.map((g) => g.id));
      setSolved([...found, ...missing]);
      setWords([]);
    }

    say(
      "comment",
      reason === "won" ? `All four groups! Score: ${score}/100.` : reason === "lives" ? "Out of lives! Here are the missing groups." : "Time's up! Here are the missing groups.",
      0,
    );
    endTimer.current = setTimeout(() => {
      finishGame("connections", score);
      navigate(nextPath("connections"));
    }, END_DELAY_MS);
  }

  function toggle(word: string) {
    if (status !== "playing") return;
    setSelected((sel) => (sel.includes(word) ? sel.filter((w) => w !== word) : sel.length < 4 ? [...sel, word] : sel));
  }

  function submit() {
    if (status !== "playing" || selected.length !== 4) return;
    const unsolved = GROUPS.filter((g) => !solved.some((s) => s.id === g.id));
    const match = unsolved.find((g) => selected.every((w) => g.words.includes(w)));

    if (match) {
      const found = [...solved, match];
      setSolved(found);
      setWords((w) => w.filter((x) => !selected.includes(x)));
      setSelected([]);
      if (found.length === GROUPS.length) endGame("won", found, mistakes, timeLeft);
      else say("comment", `Yes! ${match.category}. +${match.points}`, 3500);
    } else {
      const oneAway = unsolved.some((g) => selected.filter((w) => g.words.includes(w)).length === 3);
      const m = mistakes + 1;
      setMistakes(m);
      setShaking(true);
      setTimeout(() => setShaking(false), 450);
      if (m >= CONNECTIONS_MAX_MISTAKES) endGame("lives", solved, m, timeLeft);
      else say("comment", oneAway ? "So close! One word is off." : "Not a group. Try again.", 3000);
    }
  }

  function askHint() {
    if (status !== "playing") return;
    if (hintsUsed >= MAX_HINTS) return say("comment", "No more hints, you've got this!", 2500);
    const target = GROUPS.filter((g) => !solved.some((s) => s.id === g.id)).sort((a, b) => a.difficulty - b.difficulty)[0];
    if (!target) return;
    if (hintsUsed === 0) say("hint", `One group is all about "${target.category}". Can you find its four words?`, 9000);
    else {
      const word = target.words.find((w) => words.includes(w)) ?? target.words[0];
      say("hint", `"${word}" belongs to the group "${target.category}".`, 9000);
    }
    setHintsUsed((n) => n + 1);
  }

  const btn = {
    padding: "10px 22px",
    borderRadius: 999,
    border: "1.5px solid rgba(255,255,255,0.55)",
    background: "rgba(255,255,255,0.16)",
    color: "#FFFFFF",
    fontWeight: 800,
  } as const;

  return (
    // BUG CORRIGÉ : "pt-6 sm:pt-10 pb-8" ajoutaient un padding vertical fixe et
    // ASYMÉTRIQUE sur ce conteneur qui utilise déjà "justify-center" pour se
    // centrer dans l'espace disponible. Un padding plus grand en bas qu'en haut
    // décale mécaniquement le centre visuel du contenu vers le haut, en plus de
    // réduire la hauteur réellement disponible pour le centrage. Supprimé au
    // profit du seul "gap" entre les blocs, en laissant le flex parent gérer le
    // centrage vertical réel.
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-8">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        {/* Groupes déjà trouvés */}
        {solved.length > 0 && (
          <div className="flex flex-col gap-3">
            {solved.map((g) => (
              <motion.div
                key={g.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: revealedIds.includes(g.id) ? 0.85 : 1, scale: 1 }}
                style={{
                  padding: "14px 18px",
                  borderRadius: 20,
                  textAlign: "center",
                  background: DIFF_STYLE[g.difficulty].bg,
                  color: DIFF_STYLE[g.difficulty].color,
                  border: revealedIds.includes(g.id) ? "2px dashed rgba(255,255,255,0.8)" : "2px solid #FFFFFF",
                  boxShadow: "0 6px 16px rgba(49,46,129,0.25)",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "2px" }}>{g.category}</div>
                <div style={{ fontWeight: 700, opacity: 0.9 }}>{g.words.join(" · ")}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* La grille : 4 colonnes, les mots restants avec espacement accru */}
        {words.length > 0 && (
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            {words.map((word) => {
              const isSel = selected.includes(word);
              return (
                <motion.button
                  key={word}
                  layout
                  onClick={() => toggle(word)}
                  animate={isSel && shaking ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0, y: isSel ? 3 : 0 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: shaking ? 0.4 : 0.15 }}
                  style={{
                    minHeight: "4.8rem",
                    padding: "10px 8px",
                    borderRadius: 18,
                    border: "2px solid #FFFFFF",
                    fontWeight: 800,
                    fontSize: "clamp(0.85rem, 2.4vw, 1.1rem)",
                    cursor: "pointer",
                    overflowWrap: "anywhere",
                    color: isSel ? "#FFFFFF" : "#4338CA",
                    background: isSel ? "linear-gradient(135deg, #3B82F6, #8B5CF6)" : "linear-gradient(180deg, #FFFFFF, #E0E7FF)",
                    boxShadow: isSel ? "0 2px 0 #4F46E5" : "0 5px 0 #A5B4FC",
                  }}
                >
                  {word}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Barre d'actions décalée vers le bas avec de l'espace */}
      {status === "playing" && (
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button style={btn} onClick={() => setWords((w) => shuffle(w))}>
            Shuffle
          </button>
          <button style={btn} onClick={() => setSelected([])} disabled={selected.length === 0}>
            Deselect
          </button>
          <button style={btn} onClick={askHint}>
            Hint ({MAX_HINTS - hintsUsed})
          </button>
          <motion.button
            whileHover={{ scale: selected.length === 4 ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={submit}
            disabled={selected.length !== 4}
            style={{
              padding: "12px 34px",
              borderRadius: 999,
              border: "2px solid #FFFFFF",
              fontWeight: 900,
              fontSize: "1.1rem",
              color: selected.length === 4 ? "#4338CA" : "rgba(255,255,255,0.6)",
              background: selected.length === 4 ? "linear-gradient(180deg, #FFFFFF, #E0E7FF)" : "rgba(255,255,255,0.12)",
              boxShadow: selected.length === 4 ? "0 5px 0 #A5B4FC" : "none",
              cursor: selected.length === 4 ? "pointer" : "not-allowed",
            }}
          >
            Submit
          </motion.button>
        </div>
      )}
    </div>
  );
}