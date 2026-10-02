import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import Mascot from "../components/Bytie";
import WaveBorder from "../components/WaveBorder";
import "../styles/Mainframe.css";


const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const GAMES = ["Zoom Reveal", "Connections", "Timeline"];

export default function Mainframe() {
  const navigate = useNavigate();
  const startSession = useGameStore((s) => s.startSession);
  const isLoading = useGameStore((s) => s.isLoading);
  const error = useGameStore((s) => s.error);

  // Start Playing : on tire la partie (mélange des données), puis on entre dans le GameFrame
  const handleStart = async () => {
    await startSession(); // Attend que FastAPI/MongoDB renvoie le tirage aléatoire
    if (useGameStore.getState().session) navigate("/play/zoom");
  };

  return (
    <main className="mf-root">
      <div className="mf-halo blue" />
      <div className="mf-halo violet" />

      <WaveBorder position="top" />
      <WaveBorder position="bottom" duration={26} />

      <div className="mf-content">
        <div className="mf-grid">
          {/* LEFT: Bytie */}
          <motion.div
            className="mf-robot"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* layoutId collé au robot (même ratio que dans GameFrame) => transition sans déformation */}
            <motion.div
              layoutId="robot-container"
              style={{ width: "clamp(16rem, 30vw, 24rem)", aspectRatio: "400 / 550" }}
            >
              <Mascot size="100%" isWaving isThinking={false} />
            </motion.div>
          </motion.div>

          {/* RIGHT: button, title, Bytie's speech bubble, games */}
          <motion.div className="mf-right" variants={container} initial="hidden" animate="show">
            <motion.div variants={item} className="mf-btn-wrap">
              <motion.span
                className="mf-btn-glow"
                animate={{ opacity: [0.5, 0.95, 0.5], scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
              />
              <motion.button className="mf-btn" onClick={handleStart} disabled={isLoading} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96, y: 3 }}>
                <span className="mf-btn-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span>{isLoading ? "Loading…" : "Start Playing"}</span>
                <span className="mf-btn-shine" />
              </motion.button>
            </motion.div>

            {error && (
              <p role="alert" style={{ color: "#fecaca", fontWeight: 700, maxWidth: 420, margin: 0 }}>
                {error}
              </p>
            )}

            <motion.h1 variants={item} className="mf-title">
              Tech Quiz Arena
            </motion.h1>

            <motion.p variants={item} className="mf-bubble">
              Play with <b>Bytie</b> and learn more about <b>your knowledge</b>: spot your strengths, find your gaps and
              see what to master next.
            </motion.p>

            <motion.div variants={item} className="mf-pills">
              {GAMES.map((g) => (
                <span key={g} className="mf-pill">
                  {g}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}