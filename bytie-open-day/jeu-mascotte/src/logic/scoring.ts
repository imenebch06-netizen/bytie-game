const SCORING = {
  zoom: {
    stagePoints: [100, 80, 60, 40, 20],
    wrongPenalty: 10,
  },
  connections: {
    timeBonusMax: 20,
    timeLimitSec: 120,
    mistakePenalty: 5,
    denominator: 100,
  },
  timeline: {
    baseMax: 80,
    timeBonusMax: 20,
    timeLimitSec: 120,
  },
} as const;

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

/* ---------- ZOOM ---------- */
/** answeredStage : étape (0 à 4) où le joueur a trouvé, ou null s'il n'a pas trouvé */
export function scoreZoomRound(answeredStage: number | null, wrongGuesses: number): number {
  if (answeredStage === null) return 0;
  const { stagePoints, wrongPenalty } = SCORING.zoom;
  return Math.max(0, stagePoints[answeredStage] - wrongGuesses * wrongPenalty);
}

/** roundPoints : les points de chaque round -> score du jeu sur 100 */
export function scoreZoomGame(roundPoints: number[]): number {
  const max = SCORING.zoom.stagePoints[0] * roundPoints.length;
  const total = roundPoints.reduce((a, b) => a + b, 0);
  return clamp(Math.round((total / max) * 100));
}

/* ---------- CONNEXIONS ---------- */
export function scoreConnections(p: {
  foundGroupPoints: number; // somme des points des groupes trouvés (0 à 100)
  mistakes: number;
  timeLeftSec: number;
  allFound: boolean;
}): number {
  const c = SCORING.connections;
  const bonus = p.allFound ? c.timeBonusMax * (Math.max(0, p.timeLeftSec) / c.timeLimitSec) : 0;
  const raw = p.foundGroupPoints - c.mistakePenalty * p.mistakes + bonus;
  return clamp(Math.round((raw / c.denominator) * 100));
}

/* ---------- TIMELINE ---------- */
/** Part des paires bien ordonnées. Avec 4 événements il y a 6 paires (et non plus 10 comme avec 5 événements). */
export function pairsAccuracy(playerOrderYears: number[]): number {
  let good = 0;
  let total = 0;
  for (let i = 0; i < playerOrderYears.length; i++) {
    for (let j = i + 1; j < playerOrderYears.length; j++) {
      total += 1;
      if (playerOrderYears[i] < playerOrderYears[j]) good += 1;
    }
  }
  return total === 0 ? 0 : good / total;
}

export function scoreTimelineRound(playerOrderYears: number[], timeLeftSec: number): number {
  const t = SCORING.timeline;
  const accuracy = pairsAccuracy(playerOrderYears);
  const base = t.baseMax * accuracy;
  const bonus = t.timeBonusMax * (Math.max(0, timeLeftSec) / t.timeLimitSec) * accuracy;
  return clamp(Math.round(base + bonus));
}

export function scoreTimelineGame(roundScores: number[]): number {
  return roundScores.length ? Math.round(roundScores.reduce((a, b) => a + b, 0) / roundScores.length) : 0;
}