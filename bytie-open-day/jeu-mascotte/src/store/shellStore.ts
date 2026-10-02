import { create } from "zustand";
import type { BubbleMessage } from "../components/Speechbubble";


interface ShellState {
  bubble: BubbleMessage | null;
  thinking: boolean;
  hud: string | null;
  
  say: (type: BubbleMessage["type"], text: string, ttlMs?: number, badge?: string) => void;
  clear: () => void;
  setThinking: (v: boolean) => void;
  setHud: (text: string | null) => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useShell = create<ShellState>((set) => ({
  bubble: null,
  thinking: false,
  hud: null,
  say: (type, text, ttlMs = 6000, badge) => {
    clearTimeout(timer);
    set({ bubble: { type, text, badge }, thinking: false });
    if (ttlMs > 0) timer = setTimeout(() => set({ bubble: null }), ttlMs);
  },
  clear: () => {
    clearTimeout(timer);
    set({ bubble: null });
  },
  setThinking: (thinking) => set({ thinking }),
  setHud: (hud) => set({ hud }),
}));