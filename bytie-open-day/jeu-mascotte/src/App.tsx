// src/App.tsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LayoutGroup } from "framer-motion";
import Mainframe from "./pages/Mainframe";
import GameShell from "./pages/GameShell";
import ZoomGame from "./games/ZoomGame";
import ConnectionsGame from "./games/ConnectionsGame";
import TimelineGame from "./games/TimelineGame";
import Results from "./pages/Results";

export default function App() {
  return (
    <BrowserRouter>
      <LayoutGroup>
        <Routes>
          <Route path="/" element={<Mainframe />} />

          {/* Mini-jeux dans le GameShell */}
          <Route path="/play" element={<GameShell />}>
            <Route index element={<Navigate to="zoom" replace />} />
            <Route path="zoom" element={<ZoomGame />} />
            <Route path="connections" element={<ConnectionsGame />} />
            <Route path="timeline" element={<TimelineGame />} />
            {/* Résultats : dans le même GameFrame (fond, vagues, Bytie) que les jeux */}
            <Route path="results" element={<Results />} />
          </Route>

          {/* Redirection fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LayoutGroup>
    </BrowserRouter>
  );
}