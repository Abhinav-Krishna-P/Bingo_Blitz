import { Bell, LogOut, User2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function Navbar() {
  const { user, signOutUser } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-black/8 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <div>
          <p className="font-display text-xl text-[#b3001b]">Bingo Blitz</p>
          <p className="text-xs text-[#7a6a59]">Multiplayer party rooms</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-black/4">
            <Bell className="h-4 w-4 text-[#2a1f15]" />
          </div>

          <Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 rounded-full border border-black/10 bg-black/4 px-2 py-1.5">
                <Avatar src={user?.photoURL} fallback={user?.displayName ?? "Player"} />
                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold text-[#2a1f15]">{user?.displayName}</p>
                  <p className="text-xs text-[#7a6a59]">{user?.email}</p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DialogTrigger asChild>
                  <button type="button" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#2a1f15] hover:bg-black/6">
                    <User2 className="h-4 w-4 text-[#b3001b]" />
                    Profile
                  </button>
                </DialogTrigger>
                <DropdownMenuItem onSelect={() => void signOutUser()}>
                  <LogOut className="mr-2 h-4 w-4 text-[#b3001b]" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent>
              <h2 className="font-display text-xl tracking-[0.22em] text-[#2a1f15]">PLAYER PROFILE</h2>
              <div className="mt-6 flex items-center gap-4">
                <Avatar className="h-16 w-16" src={user?.photoURL} fallback={user?.displayName ?? "Player"} />
                <div>
                  <p className="text-lg font-semibold text-[#2a1f15]">{user?.displayName}</p>
                  <p className="text-sm text-[#7a6a59]">{user?.email}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <div className="rounded-3xl border border-black/8 bg-black/4 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#7a6a59]">Games Played</p>
                  <p className="mt-2 text-3xl font-semibold text-[#2a1f15]">0</p>
                </div>
                <div className="rounded-3xl border border-black/8 bg-black/4 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#7a6a59]">Games Won</p>
                  <p className="mt-2 text-3xl font-semibold text-[#2a1f15]">0</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
