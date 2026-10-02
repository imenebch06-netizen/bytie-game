import { useEffect, useMemo, useRef, useState } from "react";
import { Reorder, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { TimelineEvent } from "../data/gamesData";
import { SCORING } from "../config/scoring.config";
import { pairsAccuracy, scoreTimelineGame, scoreTimelineRound } from "../logic/scoring";
import { nextPath, useGameStore } from "../store/gameStore";
import { useShell } from "../store/shellStore";

const ROUND_TIME = SCORING.timeline.timeLimitSec;
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function TimelineGame() {
  const rounds = useGameStore((s) => s.session!.timeline);
  const finishGame = useGameStore((s) => s.finishGame);
  const { say, clear, setHud } = useShell();
  const navigate = useNavigate();

  const [roundIdx, setRoundIdx] = useState(0);
  const [order, setOrder] = useState<TimelineEvent[]>(rounds[0].shuffled);
  const [status, setStatus] = useState<"playing" | "revealed">("playing");
  const [secs, setSecs] = useState<number>(ROUND_TIME);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [lastPoints, setLastPoints] = useState(0);

  // refs : le chrono et la soumission automatique lisent toujours la valeur la plus récente
  const orderRef = useRef(order);
  orderRef.current = order;
  const leftRef = useRef<number>(ROUND_TIME);
  const submittedRef = useRef(false);

  const { round } = rounds[roundIdx];
  const chronological = useMemo(() => [...round.events].sort((a, b) => a.year - b.year), [round]);
  const isLastRound = roundIdx === rounds.length - 1;

  /* Chrono de la manche. À 0 : on soumet l'ordre actuel avec un bonus de temps nul. */
  useEffect(() => {
    if (status !== "playing") return;
    submittedRef.current = false;
    const start = Date.now();
    leftRef.current = ROUND_TIME;
    setSecs(ROUND_TIME);
    const id = setInterval(() => {
      const left = Math.max(0, ROUND_TIME - (Date.now() - start) / 1000);
      leftRef.current = left;
      setSecs(Math.ceil(left));
      if (left <= 0) {
        clearInterval(id);
        submit(true);
      }
    }, 200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx, status]);

  /* En-tête */
  useEffect(() => {
    setHud(`Round ${roundIdx + 1}/${rounds.length} · ${mmss(secs)}`);
  }, [roundIdx, secs, rounds.length, setHud]);

  useEffect(() => {
    say("comment", roundIdx === 0 ? "Put these events in order, oldest at the top!" : "Next round. Same rule: oldest first!", 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx]);

  function submit(timedOut = false) {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const years = orderRef.current.map((e) => e.year);
    const points = scoreTimelineRound(years, timedOut ? 0 : leftRef.current);
    const accuracy = pairsAccuracy(years);

    setRoundScores((s) => [...s, points]);
    setLastPoints(points);
    setStatus("revealed");

    if (accuracy === 1) say("comment", `Perfect order! +${points}`, 0);
    else if (accuracy >= 0.66) say("comment", `Almost! Only a few are misplaced. +${points}`, 0);
    else say("comment", timedOut ? `Time's up! +${points}` : `Not quite. Check the real dates below. +${points}`, 0);
  }

  function next() {
    if (isLastRound) {
      finishGame("timeline", scoreTimelineGame(roundScores));
      navigate(nextPath("timeline"));
    } else {
      clear();
      setOrder(rounds[roundIdx + 1].shuffled);
      setRoundIdx(roundIdx + 1);
      setStatus("playing");
    }
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const copy = [...order];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setOrder(copy);
  }

  const arrow = {
    width: 34,
    height: 30,
    borderRadius: 10,
    border: "none",
    fontWeight: 900,
    color: "#4338CA",
    background: "#E0E7FF",
    cursor: "pointer",
  } as const;

  return (
    
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-3">
      {/* Barre de temps */}
      {status === "playing" && (
        <div style={{ width: "100%", maxWidth: "36rem", height: 8, borderRadius: 4, background: "rgba(255,255,255,0.25)" }}>
          <div style={{ width: `${(secs / ROUND_TIME) * 100}%`, height: "100%", borderRadius: 4, background: "#FFFFFF", transition: "width 0.3s linear" }} />
        </div>
      )}

      <p className="m-0 text-sm font-extrabold text-white/80">▲ Oldest</p>

      <Reorder.Group
        axis="y"
        values={order}
        onReorder={setOrder}
        as="ol"
        style={{ listStyle: "none", margin: 0, padding: 0, width: "100%", maxWidth: "36rem", display: "flex", flexDirection: "column", gap: 10 }}
      >
        {order.map((ev, i) => {
          const revealed = status === "revealed";
          const correct = revealed && ev.year === chronological[i].year;
          return (
            <Reorder.Item
              key={ev.id}
              value={ev}
              dragListener={!revealed}
              whileDrag={{ scale: 1.03, boxShadow: "0 18px 36px rgba(49,46,129,0.5)" }}
              style={{
                padding: "12px 14px",
                borderRadius: 20,
                cursor: revealed ? "default" : "grab",
                border: revealed && !correct ? "2px dashed #C4B5FD" : "2px solid #FFFFFF",
                color: correct ? "#FFFFFF" : "#312E81",
                background: correct ? "linear-gradient(135deg, #3B82F6, #8B5CF6)" : "linear-gradient(180deg, #FFFFFF, #EEF2FF)",
                boxShadow: "0 6px 0 rgba(165,180,252,0.9)",
                touchAction: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontWeight: 900, opacity: 0.5, width: 18 }}>{i + 1}</span>
                <span style={{ flex: 1, fontWeight: 800, fontSize: "1.05rem" }}>{ev.title}</span>

                {revealed ? (
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontWeight: 900,
                      background: correct ? "rgba(255,255,255,0.25)" : "#DDD6FE",
                      color: correct ? "#FFFFFF" : "#4C1D95",
                    }}
                  >
                    {correct ? "✓ " : ""}
                    {ev.year}
                  </span>
                ) : (
                  <span style={{ display: "flex", flexDirection: "column", gap: 4 }} onPointerDown={(e) => e.stopPropagation()}>
                    <button aria-label="Move up" style={arrow} onClick={() => move(i, -1)} disabled={i === 0}>
                      ▲
                    </button>
                    <button aria-label="Move down" style={arrow} onClick={() => move(i, 1)} disabled={i === order.length - 1}>
                      ▼
                    </button>
                  </span>
                )}
              </div>
              {revealed && <p style={{ margin: "6px 0 0 30px", fontSize: "0.9rem", fontWeight: 600, opacity: 0.9 }}>{ev.fact}</p>}
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      <p className="m-0 text-sm font-extrabold text-white/80">▼ Newest</p>

      {status === "playing" ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => submit(false)}
          style={{ padding: "12px 38px", borderRadius: 999, border: "2px solid #FFFFFF", fontWeight: 900, fontSize: "1.1rem", color: "#4338CA", background: "linear-gradient(180deg, #FFFFFF, #E0E7FF)", boxShadow: "0 5px 0 #A5B4FC" }}
        >
          Check my order
        </motion.button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="m-0 font-extrabold text-white">Round score: {lastPoints}/100</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={next}
            style={{ padding: "12px 38px", borderRadius: 999, border: "2px solid #FFFFFF", fontWeight: 900, fontSize: "1.1rem", color: "#4338CA", background: "linear-gradient(180deg, #FFFFFF, #E0E7FF)", boxShadow: "0 5px 0 #A5B4FC" }}
          >
            {isLastRound ? "See my results" : "Next round"}
          </motion.button>
        </div>
      )}
    </div>
  );
}