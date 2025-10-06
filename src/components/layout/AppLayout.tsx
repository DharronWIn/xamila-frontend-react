import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { NotificationManager } from "@/components/NotificationManager";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <NotificationManager />
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="sticky top-0 z-50">
            <TopNavigation />
          </div>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
        <LoadingOverlay />
      </div>
    </SidebarProvider>
  );
}