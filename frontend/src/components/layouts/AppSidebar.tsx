import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Home,
  Receipt,
  Wallet,
  BarChart3,
  ClipboardList,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Warga", href: "/warga", icon: Users },
  { title: "Rumah", href: "/rumah", icon: Home },
  { title: "Tagihan & Pembayaran", href: "/tagihan", icon: Receipt },
  { title: "Pengeluaran", href: "/pengeluaran", icon: Wallet },
  { title: "Laporan", href: "/laporan", icon: BarChart3 },
  { title: "Tagihan & Pengeluaran Rutin", href: "/templates", icon: ClipboardList },
];

export function AppSidebar() {
  const location = useLocation();
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3F72AF] text-white font-bold text-sm",
              !open && "h-8 w-8 rounded-lg",
            )}
          >
            RT
          </div>
          {open && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#112D4E]">
                RT Sejahtera
              </span>
              <span className="text-xs text-muted-foreground">
                Manajemen Iuran
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs uppercase tracking-wider text-muted-foreground/70">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "h-10 rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-[#3F72AF] text-white hover:bg-[#3F72AF]/90 hover:text-white"
                          : "text-[#112D4E]/70 hover:bg-[#DBE2EF]/50 hover:text-[#112D4E]",
                      )}
                    >
                      <NavLink to={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span className="font-medium">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-3">
        {/* <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-center rounded-xl text-muted-foreground hover:bg-[#DBE2EF]/50 hover:text-[#112D4E]"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform duration-300', !open && 'rotate-180')} />
          {open && <span className="ml-2 text-xs">Tutup Menu</span>}
        </Button> */}
      </SidebarFooter>
    </Sidebar>
  );
}
