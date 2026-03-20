import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTimeTheme } from "@/hooks/useTimeTheme";

export function DashboardLayout() {
  const location = useLocation();
  const timeShift = useTimeTheme();

  return (
    <SidebarProvider>
      <div className={`flex min-h-screen w-full bg-slate-50/50 dark:bg-slate-950/50 theme-${timeShift}`}>
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
            <div className="mx-auto w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Outlet />
            </div>
          </main>
          <BottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
