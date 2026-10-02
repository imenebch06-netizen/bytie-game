
export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:8000";
const API_URL = `${API_ORIGIN}/api/game`;

 
export const resolveAssetUrl = (path: string): string =>
  /^(https?:|data:|blob:)/.test(path) ? path : `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;

export const fetchGameSession = async () => {
  const response = await fetch(`${API_URL}/session`);

  if (!response.ok) {
    let detail = `Erreur HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body?.detail) detail = String(body.detail);
    } catch {
     
    }
    throw new Error(detail);
  }
  return response.json();
};

export const submitZoomScore = async (answeredStage: number | null, wrongGuesses: number) => {
  const response = await fetch(`${API_URL}/score/zoom`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answered_stage: answeredStage, wrong_guesses: wrongGuesses }),
  });
  if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
  return response.json();
};

export interface AIAnalysisPayload {
  zoom_score: number;
  connections_score: number;
  timeline_score: number;
  rank_title: "PRO MASTER" | "INTERMEDIATE" | "BEGINNER";
  language: "en" | "fr";
}

export interface AIAnalysisResult {
  comment: string;
  
  source: "gemini" | "fallback";
  model: string | null;
}

export const fetchAIAnalysis = async (payload: AIAnalysisPayload, signal?: AbortSignal): Promise<AIAnalysisResult> => {
  const response = await fetch(`${API_URL}/ai-analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
  return response.json();
};
