/* Tous les chiffres du barème au même endroit : on peut les régler après des tests sans toucher à la logique. */
export const SCORING = {
  zoom: {
    /** Points si on trouve à l'étape 1, 2, 3, 4, 5 du zoom */
    stagePoints: [100, 80, 60, 40, 20],
    /** Malus par mauvaise réponse (le round ne descend jamais sous 0) */
    wrongPenalty: 10,
    /** Durée de chaque étape de zoom : c'est l'horloge du jeu */
    stageDurationMs: 6000,
  },
  connections: {
    /** Points des groupes trouvés, du plus simple au plus difficile (100 max) */
    groupPoints: [10, 20, 30, 40],
    mistakePenalty: 5,
    /** Bonus de temps, seulement si les 4 groupes sont trouvés */
    timeBonusMax: 20,
    timeLimitSec: 180,
    /** 100 (groupes) + 20 (bonus) */
    denominator: 120,
  },
  timeline: {
    /** Points pour une manche 100 % correcte, avant bonus */
    baseMax: 80,
    /** Bonus de temps, multiplié par la précision : se dépêcher sur une mauvaise réponse ne rapporte presque rien */
    timeBonusMax: 20,
    timeLimitSec: 45,
  },
} as const;