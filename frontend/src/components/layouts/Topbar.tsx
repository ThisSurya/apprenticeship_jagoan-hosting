import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/warga": "Manajemen Warga",
  "/rumah": "Manajemen Rumah",
  "/tagihan": "Tagihan & Pembayaran",
  "/pengeluaran": "Pengeluaran",
  "/laporan": "Laporan",
};

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getTitle = () => {
    if (location.pathname.startsWith("/rumah/")) return "Detail Rumah";
    return pageTitles[location.pathname] || "Dashboard";
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#DBE2EF]/60 bg-white/80 backdrop-blur-sm px-6 sticky top-0 z-9999">
      <div className="flex items-center gap-3">
        {/* <SidebarTrigger className="text-[#112D4E]/60 hover:text-[#112D4E] hover:bg-[#DBE2EF]/40 rounded-lg" /> */}
        <Separator orientation="vertical" className="h-6" />
        <h1 className="text-lg font-semibold text-[#112D4E]">{getTitle()}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-[#DBE2EF]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3F72AF]/50">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-[#112D4E]">
                {user?.name || "Admin RT"}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email || "admin@example.com"}
              </p>
            </div>
            <Avatar className="h-9 w-9 border-2 border-[#DBE2EF]">
              <AvatarFallback className="bg-[#3F72AF] text-white text-xs font-bold uppercase">
                {user?.name?.substring(0, 2) || "AD"}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 rounded-xl border-[#DBE2EF]"
        >
          {/* <DropdownMenuItem className="rounded-lg cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profil Saya
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Pengaturan
          </DropdownMenuItem>
          <DropdownMenuSeparator /> */}
          <DropdownMenuItem
            className="rounded-lg cursor-pointer text-red-600 focus:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
