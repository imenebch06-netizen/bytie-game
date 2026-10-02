import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type BubbleType = "comment" | "hint";

export interface BubbleMessage {
  type: BubbleType;
  text: string;
  /** Petite pastille dans l'en-tête de la bulle (ex. "AI · Gemini" pour un texte généré par l'IA) */
  badge?: string;
}

interface SpeechBubbleProps extends BubbleMessage {
  /** Effet machine à écrire (désactivé automatiquement si l'utilisateur réduit les animations). */
  typewriter?: boolean;
  /** Vitesse en ms par caractère. */
  speed?: number;
  tailPosition?: "left" | "responsive" | "center";
  /** Prévenu quand le texte commence / finit de s'écrire -> sert à animer la bouche de Bytie. */
  onTypingChange?: (typing: boolean) => void;
}

/* Deux looks distincts, mais dans la même palette blanc / bleu / violet */
const LOOKS = {
  comment: {
    background: "linear-gradient(180deg, #FFFFFF 0%, #EEF2FF 100%)",
    tail: "#EEF2FF",
    color: "#312E81",
    border: "2px solid #FFFFFF",
    shadow: "0 14px 34px rgba(49, 46, 129, 0.4)",
  },
  hint: {
    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    tail: "#6542E9",
    color: "#FFFFFF",
    border: "2px solid rgba(255, 255, 255, 0.75)",
    shadow: "0 14px 34px rgba(49, 46, 129, 0.55)",
  },
} as const;

function Lightbulb() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21h6" />
      <path d="M10 17.5h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2v.5h5v-.5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

function Sparkle() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2zM19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9L19 15z" />
    </svg>
  );
}

export default function SpeechBubble({
  type,
  text,
  badge,
  typewriter = true,
  speed = 22,
  tailPosition = "left",
  onTypingChange,
}: SpeechBubbleProps) {
  const look = LOOKS[type];
  const isHint = type === "hint";
  const reduceMotion = useReducedMotion();
  const animateText = typewriter && !reduceMotion;

  const [shown, setShown] = useState(animateText ? 0 : text.length);

  // on garde le callback dans une ref pour ne pas relancer l'effet à chaque rendu du parent
  const cb = useRef(onTypingChange);
  cb.current = onTypingChange;

  useEffect(() => {
    if (!animateText) {
      setShown(text.length);
      return;
    }
    let i = 0;
    setShown(0);
    cb.current?.(true);
    const id = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= text.length) {
        clearInterval(id);
        cb.current?.(false);
      }
    }, speed);
    return () => {
      clearInterval(id);
      cb.current?.(false);
    };
  }, [text, animateText, speed]);

  return (
    <motion.div
      role="status"
      aria-label={text}
      // la bulle "pousse" depuis la queue, côté tête du robot
      style={{ transformOrigin: "3.5rem 100%", position: "relative" }}
      initial={{ opacity: 0, scale: 0.6, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 8 }}
      transition={{ type: "spring", stiffness: 320, damping: 20 }}
    >
      {/* Halo qui pulse derrière l'indice */}
      {isHint && (
        <motion.span
          aria-hidden="true"
          animate={{ opacity: [0.35, 0.8, 0.35], scale: [1, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: 30,
            background: "linear-gradient(90deg, #93C5FD, #C4B5FD)",
            filter: "blur(16px)",
          }}
        />
      )}

      <div
        style={{
          position: "relative",
          padding: "12px 18px 14px",
          borderRadius: 24,
          background: look.background,
          color: look.color,
          border: look.border,
          boxShadow: look.shadow,
          fontFamily: '"Nunito", "Segoe UI", system-ui, sans-serif',
        }}
      >
        {/* En-tête : nom du robot, ou ampoule + "Hint" */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          {isHint ? (
            <>
              <motion.span
                animate={{ scale: [1, 1.18, 1], rotate: [0, -8, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  color: "#6D28D9",
                  boxShadow: "0 0 14px 3px rgba(255,255,255,0.7)",
                }}
              >
                <Lightbulb />
              </motion.span>
              <span style={{ fontSize: "0.95rem", fontWeight: 800, letterSpacing: "0.02em" }}>Hint</span>
            </>
          ) : (
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#6366F1" }}>Bytie</span>
          )}
          {badge && (
            <span
              style={{
                marginLeft: "auto",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 9px",
                borderRadius: 999,
                fontSize: "0.68rem",
                fontWeight: 800,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: isHint ? "#FFFFFF" : "#4338CA",
                background: isHint ? "rgba(255,255,255,0.2)" : "linear-gradient(90deg, #DBEAFE, #EDE9FE)",
                border: isHint ? "1px solid rgba(255,255,255,0.5)" : "1px solid #C7D2FE",
              }}
            >
              <Sparkle />
              {badge}
            </span>
          )}
        </div>

        {/* Texte : le texte complet (invisible) réserve la place, donc la bulle ne saute pas pendant la frappe */}
        <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: isHint ? 700 : 600, lineHeight: 1.45, position: "relative" }}>
          <span style={{ visibility: "hidden" }} aria-hidden="true">
            {text}
          </span>
          <span style={{ position: "absolute", inset: 0 }} aria-hidden="true">
            {text.slice(0, shown)}
          </span>
        </p>

        {/* Queue de la bulle, qui pointe vers la tête de Bytie (à 3.5rem du bord gauche) */}
        <span
          aria-hidden="true"
          className={
            tailPosition === "responsive"
              ? "left-1/2 -translate-x-1/2 md:left-14 md:translate-x-0"
              : tailPosition === "center"
                ? "left-1/2 -translate-x-1/2"
                : "left-14"
          }
          style={{
            position: "absolute",
            bottom: -9,
            marginLeft: -8,
            width: 16,
            height: 16,
            background: look.tail,
            borderRight: look.border,
            borderBottom: look.border,
            transform: "rotate(45deg)",
            borderBottomRightRadius: 4,
          }}
        />
      </div>
    </motion.div>
  );
}