import type { ReactElement } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { AppShell } from "@/components/common/AppShell";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { DashboardPage } from "@/pages/DashboardPage";
import { GamePage } from "@/pages/GamePage";
import { LandingPage } from "@/pages/LandingPage";
import { LobbyPage } from "@/pages/LobbyPage";

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen label="Booting command room..." />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <AppShell>{children}</AppShell>;
}

function LobbyRoute() {
  const { gameId = "" } = useParams();
  return (
    <ProtectedRoute>
      <LobbyPage gameId={gameId} />
    </ProtectedRoute>
  );
}

function GameRoute() {
  const { gameId = "" } = useParams();
  return (
    <ProtectedRoute>
      <GamePage gameId={gameId} />
    </ProtectedRoute>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/lobby/:gameId" element={<LobbyRoute />} />
      <Route path="/game/:gameId" element={<GameRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
