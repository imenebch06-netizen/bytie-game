import { useId, type ReactNode } from "react";
import { motion, type TargetAndTransition, type Transition } from "framer-motion";

/* Palette : uniquement blanc, bleu et violet (avec leurs nuances) */
const colors = {
  dark: "#312E81",   // indigo profond
  glow: "#C7D2FE",   // bleu-violet lumineux (yeux, bouche)
  halo: "#818CF8",   // halo autour des lueurs
  shadow: "#C4B5FD", // violet clair
};

const loop = (duration: number, delay = 0): Transition => ({
  repeat: Infinity,
  duration,
  delay,
  ease: "easeInOut",
});

/**
 * Pivot : fait tourner / grossir un groupe autour d'un point PRÉCIS.
 * Le <g> parent place le point (x, y), et un rectangle invisible et symétrique
 * centre la boîte de l'élément sur ce point -> l'origine de transformation
 * tombe toujours pile dessus (plus de tête ou de bras qui "décroche").
 */
function Pivot({
  x,
  y,
  R = 260,
  animate,
  transition,
  children,
}: {
  x: number;
  y: number;
  R?: number;
  animate?: TargetAndTransition;
  transition?: Transition;
  children: ReactNode;
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <motion.g
        animate={animate}
        transition={transition}
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
      >
        <rect x={-R} y={-R} width={R * 2} height={R * 2} fill="none" pointerEvents="none" />
        {children}
      </motion.g>
    </g>
  );
}

/** Trait lumineux : un trait large et doux derrière, un trait net devant (sans filtre, donc léger). */
function GlowStroke({
  d,
  animateD,
  transition,
  width = 10,
}: {
  d: string;
  animateD?: string[];
  transition?: Transition;
  width?: number;
}) {
  const common = { fill: "none", strokeLinecap: "round" as const, d };
  const anim = animateD ? { animate: { d: animateD }, transition } : {};
  return (
    <>
      <motion.path {...common} {...anim} stroke={colors.halo} strokeWidth={width + 12} opacity={0.35} />
      <motion.path {...common} {...anim} stroke={colors.glow} strokeWidth={width} />
    </>
  );
}

const STAR = "M0,-10 L2.5,-2.5 L10,0 L2.5,2.5 L0,10 L-2.5,2.5 L-10,0 L-2.5,-2.5Z";
const SPARKLES = [
  { x: 48, y: 150, s: 1.1, d: 0 },
  { x: 356, y: 110, s: 1.4, d: 0.8 },
  { x: 372, y: 330, s: 0.9, d: 1.6 },
  { x: 30, y: 340, s: 1.2, d: 2.2 },
  { x: 320, y: 30, s: 0.8, d: 1.2 },
  { x: 90, y: 40, s: 1, d: 2.8 },
];

/*
 * MÉCANIQUE DES BRAS (v3) :
 *  - Les DEUX bras utilisent maintenant EXACTEMENT la même géométrie (épaule ->
 *    coude -> avant-bras -> main), juste positionnée à l'épaule gauche (138)
 *    ou droite (265). Avant, le bras gauche avait un dessin différent (baseline
 *    "levée") du bras droit (baseline "tombante") -> impossible à rendre
 *    identiques juste en ajustant des angles. Maintenant les deux mains sont
 *    pixel pour pixel la même forme -> "identiques" par construction.
 *  - Pivot ÉPAULE : position générale du bras.
 *      stable  : légèrement fixe (repos), IDENTIQUE pour les deux bras.
 *      waving  : (gauche seulement, Mainframe) grande rotation qui lève le bras,
 *                puis léger balancement autour de cette position levée.
 *      talking : PETITE oscillation autour du repos (mouvement discret).
 *  - Pivot COUDE (imbriqué) : articule l'avant-bras + la main.
 *      stable/waving : 0, immobile.
 *      talking : GRANDE oscillation (nettement plus ample que l'épaule) ->
 *                c'est le coude qui porte l'essentiel du mouvement de parole.
 */
type Pose = "stable" | "waving" | "talking";

const SHOULDER_REST = -8; // valeur de repos du bras DROIT (référence)

// BUG CORRIGÉ : les deux bras partagent la même géométrie non-miroir (mêmes
// coordonnées locales, juste replacées à une autre position d'épaule) -> pour
// qu'ils paraissent EN MIROIR à l'écran, la rotation du bras gauche doit être
// l'OPPOSÉ (signe inversé) de celle du bras droit. Avant, les deux utilisaient
// exactement le même SHOULDER_REST (-8) : au lieu de pencher en miroir l'un
// vers l'autre, les deux penchaient dans le MÊME sens en absolu -> une main
// se rapprochait du corps pendant que l'autre s'en écartait (la "main gauche"
// mal alignée que tu voyais). "waving" n'est pas concerné : c'est une pose
// propre au bras gauche, déjà calculée indépendamment.
const LEFT_SHOULDER_ROTATE: Record<Pose, number | number[]> = {
  stable: -SHOULDER_REST,
  waving: [162, 174, 162, 174, 162], // bras levé (repos + ~170°) puis léger balancement
  talking: [-SHOULDER_REST, -SHOULDER_REST - 6, -SHOULDER_REST, -SHOULDER_REST + 6, -SHOULDER_REST], // petit mouvement, signe opposé au bras droit
};
const RIGHT_SHOULDER_ROTATE: Record<Pose, number | number[]> = {
  stable: SHOULDER_REST,
  waving: SHOULDER_REST, // le bras droit ne salue jamais
  talking: [SHOULDER_REST, SHOULDER_REST - 6, SHOULDER_REST, SHOULDER_REST + 6, SHOULDER_REST], // phase opposée
};

// Coudes : au repos et en "waving" ils restent à 0 (immobiles) ; en "talking"
// leur amplitude (±20°) est nettement supérieure à celle de l'épaule (±6°) :
// c'est le coude qui fait le plus gros du mouvement quand Bytie parle.
// Même correction de signe qu'au-dessus : géométrie non-miroir -> il faut
// inverser le signe du bras gauche pour un geste visuellement symétrique.
// Coudes : Flexion naturelle vers le torse (~85° max)
// Bras gauche (angle positif = vers le centre du corps)
const LEFT_ELBOW_ROTATE: Record<Pose, number | number[]> = {
  stable: 0,
  waving: 0,
  talking: [10, 80, 25, 85, 10], 
};

// Bras droit (angle négatif = vers le centre du corps, en décalage de phase)
const RIGHT_ELBOW_ROTATE: Record<Pose, number | number[]> = {
  stable: 0,
  waving: 0,
  talking: [-80, -15, -85, -20, -80],
};

/** Transition générique : une cible en tableau boucle en continu, une cible fixe se contente de s'y installer. */
function armTransition(target: number | number[], loopDuration: number): Transition {
  return Array.isArray(target)
    ? { repeat: Infinity, duration: loopDuration, ease: "easeInOut" }
    : { duration: 0.6, ease: "easeOut" };
}

// Réglage de la durée à 1.8s pour un mouvement fluide et apaisé ("pas rapide")


export default function Mascot({
  isWaving = true,
  isThinking = false,
  isTalking = false, // à brancher sur la voix (TTS) ou sur la bulle de texte pour animer la bouche
  size = "clamp(16rem, 30vw, 24rem)", // largeur du robot ; "100%" = prend la largeur de son parent
}: {
  isWaving?: boolean;
  isThinking?: boolean;
  isTalking?: boolean;
  size?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const g = (n: string) => `url(#${uid}${n})`;

  const pose: Pose = isTalking ? "talking" : isWaving ? "waving" : "stable";

  const leftShoulderAnimate = { rotate: LEFT_SHOULDER_ROTATE[pose] };
  const leftShoulderTransition = armTransition(LEFT_SHOULDER_ROTATE[pose], pose === "waving" ? 1.6 : 0.7);

  const rightShoulderAnimate = { rotate: RIGHT_SHOULDER_ROTATE[pose] };
  const rightShoulderTransition = armTransition(RIGHT_SHOULDER_ROTATE[pose], 0.7);

  const leftElbowAnimate = { rotate: LEFT_ELBOW_ROTATE[pose] };
  const rightElbowAnimate = { rotate: RIGHT_ELBOW_ROTATE[pose] };
  const elbowTransition = armTransition(LEFT_ELBOW_ROTATE[pose], 1.8);
  
  const idleMouth = ["M -20 15 Q 0 35 20 15", "M -20 15 Q 0 29 20 15", "M -20 15 Q 0 35 20 15"];
  const talkMouth = ["M -20 12 Q 0 52 20 12", "M -20 16 Q 0 22 20 16", "M -20 12 Q 0 44 20 12", "M -20 16 Q 0 24 20 16", "M -20 12 Q 0 52 20 12"];

  return (
    // Cliquer sur le robot le fait sauter
    <motion.div
      whileHover={{ scale: 1.05, rotate: -1.5 }}
      whileTap={{ y: -26, scale: 1.08 }}
      transition={{ type: "spring", stiffness: 300, damping: 12 }}
      style={{
        width: size,
        aspectRatio: "400 / 550",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <svg viewBox="0 0 400 550" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <linearGradient id={`${uid}body`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.55" stopColor="#F3F0FF" />
            <stop offset="1" stopColor="#DDD6FE" />
          </linearGradient>
          <linearGradient id={`${uid}joint`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#93C5FD" />
            <stop offset="0.5" stopColor="#3B82F6" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id={`${uid}dark`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4F46E5" />
            <stop offset="1" stopColor="#312E81" />
          </linearGradient>
          <linearGradient id={`${uid}screen`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1E1B4B" />
            <stop offset="0.6" stopColor="#2E2A7A" />
            <stop offset="1" stopColor="#1E3A8A" />
          </linearGradient>
          <radialGradient id={`${uid}orb`}>
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.5" stopColor="#C4B5FD" />
            <stop offset="1" stopColor="#6366F1" />
          </radialGradient>
          <radialGradient id={`${uid}aura`}>
            <stop offset="0" stopColor="#C4B5FD" stopOpacity="0.55" />
            <stop offset="0.5" stopColor="#818CF8" stopOpacity="0.25" />
            <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
          <pattern id={`${uid}scan`} width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="1.4" fill="#FFFFFF" opacity="0.06" />
          </pattern>
        </defs>

        {/* ===== AURA lumineuse derrière le robot ===== */}
        <Pivot x={200} y={290} R={300} animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }} transition={loop(4)}>
          <circle cx="0" cy="0" r="280" fill={g("aura")} />
        </Pivot>

        {/* ===== ÉTINCELLES qui scintillent ===== */}
        {SPARKLES.map((p, i) => (
          <Pivot
            key={i}
            x={p.x}
            y={p.y}
            R={14}
            animate={{ scale: [0, p.s, 0], rotate: [0, 90], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: p.d, ease: "easeInOut" }}
          >
            <path d={STAR} fill="#FFFFFF" />
          </Pivot>
        ))}

        {/* ===== OMBRE AU SOL : rétrécit quand le robot monte ===== */}
        <Pivot x={200} y={556} R={120} animate={{ scaleX: [1, 0.86, 1], opacity: [0.35, 0.22, 0.35] }} transition={loop(3)}>
          <ellipse cx="0" cy="0" rx="95" ry="11" fill={colors.dark} />
        </Pivot>

        {/* ===== JAMBES ===== */}
        <g id="legs" transform="translate(200, 410)">
          <rect x="-55" y="0" width="30" height="70" rx="15" fill={g("body")} />
          <circle cx="-40" cy="70" r="12" fill={g("joint")} />
          <rect x="-50" y="70" width="20" height="60" rx="10" fill={g("body")} />
          <path d="M -65 130 Q -40 110 -15 130 L -15 140 L -65 140 Z" fill={g("body")} />
          <rect x="-65" y="134" width="50" height="8" rx="4" fill={g("dark")} />

          <rect x="25" y="0" width="30" height="70" rx="15" fill={g("body")} />
          <circle cx="40" cy="70" r="12" fill={g("joint")} />
          <rect x="30" y="70" width="20" height="60" rx="10" fill={g("body")} />
          <path d="M 15 130 Q 40 110 65 130 L 65 140 L 15 140 Z" fill={g("body")} />
          <rect x="15" y="134" width="50" height="8" rx="4" fill={g("dark")} />
        </g>

        {/* ===== CORPS QUI RESPIRE ===== */}
        <motion.g animate={{ y: [0, -8, 0] }} transition={loop(3)}>
          {/* BRAS GAUCHE : même géométrie que le bras droit (miroir), pour des
              mains strictement identiques. Épaule quasi fixe au repos et en
              parole (petit mouvement) ; ne se lève franchement que pour le
              salut ("waving", Mainframe uniquement). */}
          <Pivot x={138} y={240} animate={leftShoulderAnimate} transition={leftShoulderTransition}>
            <circle cx="0" cy="0" r="22" fill={g("body")} />
            <rect x="-13" y="0" width="26" height="80" rx="13" fill={g("body")} />
            <circle cx="0" cy="80" r="16" fill={g("joint")} />
            <Pivot x={0} y={80} R={90} animate={leftElbowAnimate} transition={elbowTransition}>
              <rect x="-12" y="0" width="24" height="70" rx="12" fill={g("body")} />
              <rect x="-17" y="60" width="34" height="40" rx="12" fill={g("body")} />
              <line x1="-7" y1="80" x2="-7" y2="100" stroke={colors.shadow} strokeWidth="3" />
              <line x1="3" y1="80" x2="3" y2="100" stroke={colors.shadow} strokeWidth="3" />
            </Pivot>
          </Pivot>

          {/* BRAS DROIT : géométrie strictement identique au bras gauche (miroir
              par la seule position de l'épaule, 265 au lieu de 138). Ne salue
              jamais ; petit mouvement d'épaule + grand mouvement de coude
              pendant que Bytie parle, comme le bras gauche mais en phase opposée. */}
          <Pivot x={265} y={240} animate={rightShoulderAnimate} transition={rightShoulderTransition}>
            <circle cx="0" cy="0" r="22" fill={g("body")} />
            <rect x="-13" y="0" width="26" height="80" rx="13" fill={g("body")} />
            <circle cx="0" cy="80" r="16" fill={g("joint")} />
            <Pivot x={0} y={80} R={90} animate={rightElbowAnimate} transition={elbowTransition}>
              <rect x="-12" y="0" width="24" height="70" rx="12" fill={g("body")} />
              <rect x="-17" y="60" width="34" height="40" rx="12" fill={g("body")} />
              <line x1="-7" y1="80" x2="-7" y2="100" stroke={colors.shadow} strokeWidth="3" />
              <line x1="3" y1="80" x2="3" y2="100" stroke={colors.shadow} strokeWidth="3" />
            </Pivot>
          </Pivot>

          {/* TORSE */}
          <g id="torso" transform="translate(200, 270)">
            <rect x="-20" y="-80" width="40" height="30" fill={g("dark")} />
            <rect x="-70" y="-50" width="140" height="120" rx="35" fill={g("body")} />
            {/* reflet */}
            <path d="M -55 -30 Q -55 -44 -38 -44 L -10 -44" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />

            {/* Cœur du robot : anneau fixe + anneau pointillé qui tourne + noyau qui pulse */}
            <circle cx="0" cy="10" r="18" stroke={g("joint")} strokeWidth="6" fill="none" />
            <Pivot x={0} y={10} R={30} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }}>
              <circle cx="0" cy="0" r="12" stroke={colors.halo} strokeWidth="3" strokeDasharray="8 6" fill="none" />
            </Pivot>
            <Pivot x={0} y={10} R={20} animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }} transition={loop(1.8)}>
              <circle cx="0" cy="0" r="6" fill={g("orb")} />
            </Pivot>
            <motion.circle cx="15" cy="-5" r="6" fill={g("joint")} animate={{ opacity: [1, 0.35, 1] }} transition={loop(1.4)} />

            {/* Panneau bas avec voyants qui clignotent */}
            <rect x="-50" y="70" width="100" height="50" rx="15" fill={g("dark")} />
            <line x1="-40" y1="85" x2="40" y2="85" stroke="#6366F1" strokeWidth="4" />
            <line x1="-40" y1="105" x2="40" y2="105" stroke="#6366F1" strokeWidth="4" />
            {[
              { x: -22, c: "#93C5FD", d: 0 },
              { x: 0, c: "#C4B5FD", d: 0.35 },
              { x: 22, c: "#FFFFFF", d: 0.7 },
            ].map((l) => (
              <motion.circle key={l.x} cx={l.x} cy="95" r="4" fill={l.c} animate={{ opacity: [0.2, 1, 0.2] }} transition={loop(1.2, l.d)} />
            ))}
            <path d="M -60 120 L 60 120 L 40 160 L -40 160 Z" fill={g("body")} />
          </g>

          {/* ===== TÊTE : flotte + s'incline autour du cou ===== */}
          <g id="head" transform="translate(200, 200)">
            <motion.g animate={{ y: [0, -3, 0] }} transition={loop(3)}>
              <Pivot x={0} y={60} animate={{ rotate: [-2.5, 2.5, -2.5] }} transition={loop(5)}>
                <g transform="translate(0 -60)">
                  {/* Antenne + orbe lumineux avec onde */}
                  <line x1="0" y1="-70" x2="0" y2="-94" stroke={colors.shadow} strokeWidth="6" strokeLinecap="round" />
                  <Pivot x={0} y={-104} R={50} animate={{ scale: [1, 3.2], opacity: [0.7, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}>
                    <circle cx="0" cy="0" r="10" fill="none" stroke={colors.shadow} strokeWidth="2" />
                  </Pivot>
                  <Pivot x={0} y={-104} R={30} animate={{ scale: [1, 1.2, 1] }} transition={loop(1.6)}>
                    <circle cx="0" cy="0" r="17" fill={colors.halo} opacity="0.3" />
                    <circle cx="0" cy="0" r="10" fill={g("orb")} />
                  </Pivot>

                  {/* Oreillettes */}
                  <rect x="-110" y="-30" width="30" height="60" rx="15" fill={g("joint")} />
                  <rect x="80" y="-30" width="30" height="60" rx="15" fill={g("joint")} />
                  <motion.rect x="-100" y="-16" width="8" height="32" rx="4" fill="#FFFFFF" animate={{ opacity: [0.25, 0.7, 0.25] }} transition={loop(2)} />
                  <motion.rect x="92" y="-16" width="8" height="32" rx="4" fill="#FFFFFF" animate={{ opacity: [0.25, 0.7, 0.25] }} transition={loop(2, 1)} />

                  {/* Coque + reflet */}
                  <rect x="-90" y="-70" width="180" height="130" rx="45" fill={g("body")} />
                  <path d="M -70 -48 Q -70 -62 -50 -62 L -10 -62" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.85" />

                  {/* Écran */}
                  <rect x="-75" y="-50" width="150" height="95" rx="30" fill={g("screen")} />
                  <rect x="-75" y="-50" width="150" height="95" rx="30" fill={g("scan")} />
                  <rect x="-75" y="-50" width="150" height="95" rx="30" fill="none" stroke={colors.halo} strokeWidth="2" opacity="0.6" />
                  <path d="M -55 -38 Q 0 -56 55 -38 L 55 -28 Q 0 -44 -55 -28 Z" fill="#FFFFFF" opacity="0.1" />

                  {isThinking ? (
                    <g id="face-thinking">
                      {[-30, 0, 30].map((cx, i) => (
                        <motion.g key={cx} animate={{ y: [0, -10, 0] }} transition={loop(0.9, i * 0.15)}>
                          <circle cx={cx} cy="-5" r="14" fill={colors.halo} opacity="0.35" />
                          <circle cx={cx} cy="-5" r="8" fill={colors.glow} />
                        </motion.g>
                      ))}
                    </g>
                  ) : (
                    <g id="face-happy">
                      {/* Joues */}
                      <motion.ellipse cx="-58" cy="22" rx="10" ry="6" fill={colors.shadow} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={loop(2.4)} />
                      <motion.ellipse cx="58" cy="22" rx="10" ry="6" fill={colors.shadow} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={loop(2.4, 0.3)} />

                      {/* Yeux : ils clignent */}
                      <Pivot
                        x={0}
                        y={-14}
                        R={70}
                        animate={{ scaleY: [1, 1, 0.08, 1, 1] }}
                        transition={{ repeat: Infinity, duration: 4.5, times: [0, 0.9, 0.94, 0.98, 1], ease: "easeInOut" }}
                      >
                        <g transform="translate(0 14)">
                          <GlowStroke d="M -45 -10 Q -30 -25 -15 -10" />
                          <GlowStroke d="M 15 -10 Q 30 -25 45 -10" />
                        </g>
                      </Pivot>

                      {/* Bouche : sourire vivant, ou bouche qui parle (isTalking) */}
                      <GlowStroke
                        d="M -20 15 Q 0 35 20 15"
                        animateD={isTalking ? talkMouth : idleMouth}
                        transition={isTalking ? { repeat: Infinity, duration: 0.7, ease: "easeInOut" } : loop(3)}
                      />
                    </g>
                  )}
                </g>
              </Pivot>
            </motion.g>
          </g>
        </motion.g>
      </svg>
    </motion.div>
  );
}