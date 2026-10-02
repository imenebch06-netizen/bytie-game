import { memo, useId } from "react";
import { motion } from "framer-motion";

interface WaveBorderProps {
  position: "top" | "bottom";
  /** Hauteur CSS. Par défaut : clamp(80px, 11vw, 150px) */
  height?: string;
  /** Durée d'un cycle en secondes (plus petit = plus rapide) */
  duration?: number;
  /** 3 teintes bleu / violet / blanc-bleuté mélangées dans les vagues */
  colors?: [string, string, string];
  /** Étincelles brillantes au-dessus des vagues */
  sparkles?: boolean;
}

// Tes 3 tracés d'origine (viewBox 1200 x 120)
const PATHS = [
  "M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z",
  "M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-51.24V0Z",
  "M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z",
];
// Même courbe, mais sans les bords : sert à tracer la ligne brillante de la crête
const CRESTS = PATHS.map((d) => d.replace(/^M0,0V([\d.]+)/, "M0,$1").replace(/V0Z$/, ""));

// Du fond vers l'avant. path = index du tracé, fill = dégradé (a/b/c) ou blanc,
// dir = sens du défilement, offset = décalage de départ (les couches ne sont jamais alignées)
const LAYERS = [
  { path: 1, fill: "white", opacity: 0.28, speed: 2.1, dir: -1, offset: -8, crest: false },
  { path: 0, fill: "b", opacity: 0.55, speed: 1.6, dir: 1, offset: -21, crest: false },
  { path: 2, fill: "c", opacity: 0.8, speed: 1.3, dir: -1, offset: -35, crest: true },
  { path: 1, fill: "a", opacity: 1, speed: 1, dir: 1, offset: -3, crest: true },
] as const;

const SPARKLES = [
  { x: 6, y: 18, s: 5, d: 0 }, { x: 15, y: 46, s: 3, d: 1.1 }, { x: 24, y: 10, s: 4, d: 2.3 },
  { x: 33, y: 36, s: 6, d: 0.6 }, { x: 44, y: 20, s: 3, d: 1.8 }, { x: 53, y: 50, s: 4, d: 2.9 },
  { x: 62, y: 14, s: 6, d: 0.3 }, { x: 71, y: 40, s: 3, d: 1.5 }, { x: 80, y: 22, s: 5, d: 2.6 },
  { x: 88, y: 48, s: 4, d: 0.9 }, { x: 94, y: 12, s: 3, d: 2.0 },
];

function WaveBorder({
  position,
  height,
  duration = 22,
  colors = ["#60A5FA", "#6366F1", "#A78BFA"],
  sparkles = true,
}: WaveBorderProps) {
  const uid = useId().replace(/:/g, "");
  const [c0, c1, c2] = colors;
  const isTop = position === "top";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: 0,
        width: "100%",
        height: height ?? "clamp(80px, 11vw, 150px)",
        overflow: "hidden",
        lineHeight: 0,
        pointerEvents: "none",
        ...(isTop ? { top: 0 } : { bottom: 0 }),
      }}
    >
      {/* Vagues (tes tracés pendent du haut : on les retourne pour le bas de l'écran) */}
      <div style={{ position: "absolute", inset: 0, transform: isTop ? "none" : "scaleY(-1)" }}>
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            {/* 3 dégradés cycliques bleu / violet / lavande, qui bouclent sans couture */}
            {[
              ["a", c0, c1, c2],
              ["b", c1, c2, c0],
              ["c", c2, c0, c1],
            ].map(([id, s0, s1, s2]) => (
              <linearGradient key={id} id={`${uid}${id}`} x1="0" x2="2400" gradientUnits="userSpaceOnUse" spreadMethod="repeat">
                <stop offset="0" stopColor={s0} />
                <stop offset="0.33" stopColor={s1} />
                <stop offset="0.66" stopColor={s2} />
                <stop offset="1" stopColor={s0} />
              </linearGradient>
            ))}
          </defs>
        </svg>

        {LAYERS.map((l, i) => {
          const from = l.offset;
          const to = l.offset - 50;
          const fill = l.fill === "white" ? "#FFFFFF" : `url(#${uid}${l.fill})`;
          return (
            <motion.svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 4800 120"
              preserveAspectRatio="none"
              // === ANIMATION : défilement infini (comme ton original) + flottement vertical ===
              initial={{ x: `${from}%` }}
              animate={{
                x: l.dir === 1 ? [`${from}%`, `${to}%`] : [`${to}%`, `${from}%`],
                y: [-4, 6],
              }}
              transition={{
                x: { repeat: Infinity, ease: "linear", duration: duration * l.speed },
                y: { repeat: Infinity, repeatType: "mirror", ease: "easeInOut", duration: 4 + i * 1.3 },
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                display: "block",
                width: "400%", // 4 tuiles : glisser de -50% = boucle parfaite
                height: "100%",
                opacity: l.opacity,
                willChange: "transform",
              }}
            >
              <defs>
                <path id={`${uid}p${i}`} d={PATHS[l.path]} />
                <path id={`${uid}c${i}`} d={CRESTS[l.path]} vectorEffect="non-scaling-stroke" />
              </defs>
              {/* tracé, miroir, tracé, miroir : chaque jonction est raccordée */}
              <g fill={fill}>
                <use href={`#${uid}p${i}`} />
                <use href={`#${uid}p${i}`} transform="translate(2400 0) scale(-1 1)" />
                <use href={`#${uid}p${i}`} transform="translate(2400 0)" />
                <use href={`#${uid}p${i}`} transform="translate(4800 0) scale(-1 1)" />
              </g>
              {/* Ligne blanche brillante sur la crête */}
              {l.crest && (
                <g fill="none" stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={2.5} strokeLinecap="round">
                  {["", "translate(2400 0) scale(-1 1)", "translate(2400 0)", "translate(4800 0) scale(-1 1)"].map((t, k) => (
                    <use key={k} href={`#${uid}c${i}`} transform={t || undefined} />
                  ))}
                </g>
              )}
            </motion.svg>
          );
        })}
      </div>

      {/* Étincelles qui scintillent au-dessus des vagues */}
      {sparkles &&
        SPARKLES.map((p, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.8, delay: p.d, ease: "easeInOut" }}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              [isTop ? "bottom" : "top"]: `${p.y}%`,
              width: p.s,
              height: p.s,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 0 10px 3px rgba(255,255,255,0.85), 0 0 18px 6px rgba(167,139,250,0.6)",
            }}
          />
        ))}
    </div>
  );
}

export default memo(WaveBorder);