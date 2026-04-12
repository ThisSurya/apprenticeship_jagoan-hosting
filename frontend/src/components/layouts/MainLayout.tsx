import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Topbar } from './Topbar';
import { Toaster } from '@/components/ui/sonner';

export function MainLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F9F7F7]">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  );
}
