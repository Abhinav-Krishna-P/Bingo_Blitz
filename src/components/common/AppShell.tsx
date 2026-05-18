import { useLocation } from "react-router-dom";
import { InviteNotification } from "@/components/lobby/InviteNotification";
import { Navbar } from "@/components/common/Navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const isDashboard = location.pathname === "/dashboard";
  const isLobby = location.pathname.startsWith("/lobby/");
  const isGame = location.pathname.startsWith("/game/");
  const ownsLayout = isDashboard || isLobby || isGame;
  const showNavbar = !isLanding && !ownsLayout;
  const useContainer = !isLanding && !ownsLayout;

  return (
    <div className="min-h-screen">
      {showNavbar ? <Navbar /> : null}
      <main className={useContainer ? "mx-auto w-full max-w-7xl px-4 pb-10 pt-24 md:px-6" : ""}>{children}</main>
      <InviteNotification />
    </div>
  );
}
