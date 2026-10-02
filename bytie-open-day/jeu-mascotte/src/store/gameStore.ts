
import { create } from "zustand";
import { fetchGameSession, resolveAssetUrl } from "../services/api";
import type { ConnectionsGroup, TimelineEvent, TimelineRound, ZoomRound } from "../data/gamesData";

/** Une manche Timeline : l'ordre correct (round) + l'ordre mélangé présenté au joueur. */
export interface TimelineSessionRound {
  round: TimelineRound;
  shuffled: TimelineEvent[];
}

export interface GameSession {
  zoom: ZoomRound[];
  connectionsWords: string[];
  connectionsGroups: ConnectionsGroup[];
  timeline: TimelineSessionRound[];
}

/** Mélange Fisher-Yates, en garantissant un ordre différent de l'ordre chronologique. */
function shuffleEvents(events: TimelineEvent[]): TimelineEvent[] {
  const sorted = [...events].sort((a, b) => a.year - b.year);
  let a = [...events];
  for (let attempt = 0; attempt < 10; attempt++) {
    a = [...events];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    if (a.some((e, i) => e.id !== sorted[i].id)) break;
  }
  return a;
}

/** Adapte la réponse brute de l'API au format attendu par les jeux. */
function normalizeSession(raw: any): GameSession {
  if (!raw?.zoom?.length || !raw?.connectionsGroups?.length || !raw?.timeline?.length) {
    throw new Error("La session reçue est vide : la base MongoDB n'est pas remplie.");
  }
  return {
    zoom: raw.zoom.map((z: ZoomRound) => ({ ...z, image: resolveAssetUrl(z.image) })),
    connectionsWords: raw.connectionsWords,
    connectionsGroups: [...raw.connectionsGroups].sort((a: ConnectionsGroup, b: ConnectionsGroup) => a.difficulty - b.difficulty),
    timeline: raw.timeline.map((round: TimelineRound) => ({ round, shuffled: shuffleEvents(round.events) })),
  };
}

export interface GameStore {
  session: GameSession | null;
  isLoading: boolean;
  error: string | null;
  scores: {
    zoom: number | null;
    connections: number | null;
    timeline: number | null;
  };
  startSession: () => Promise<void>;
  finishGame: (game: "zoom" | "connections" | "timeline", score: number) => void;
  total: () => number;
}

export const useGameStore = create<GameStore>((set, get) => ({
  session: null,
  isLoading: false,
  error: null,
  scores: {
    zoom: null,
    connections: null,
    timeline: null,
  },

  startSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchGameSession();
      // Nouvelle partie : on repart de zéro (sinon les scores de la partie précédente resteraient affichés)
      set({ session: normalizeSession(data), isLoading: false, scores: { zoom: null, connections: null, timeline: null } });
    } catch (error: any) {
      console.error("Erreur session :", error);
      set({
        isLoading: false,
        session: null,
        error: error?.message ?? "Impossible de charger la session. Vérifiez que FastAPI et MongoDB fonctionnent.",
      });
    }
  },

  finishGame: (game, score) => {
    set((state) => ({
      scores: { ...state.scores, [game]: score },
    }));
  },

  total: () => {
    const { zoom, connections, timeline } = get().scores;
    return (zoom ?? 0) + (connections ?? 0) + (timeline ?? 0);
  },
}));

export function nextPath(currentGame: "zoom" | "connections" | "timeline"): string {
  switch (currentGame) {
    case "zoom":
      return "/play/connections";
    case "connections":
      return "/play/timeline";
    case "timeline":
      return "/play/results";
    default:
      return "/play/results";
  }
}