import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Moon, Sun, Search, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/60 px-4 md:px-8 backdrop-blur-xl">
      <SidebarTrigger className="-ml-2 md:ml-0 shrink-0" />      
      {/* Mobile Branding */}
      <div className="flex md:hidden items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span className="text-sm font-black tracking-tighter">MODERN PG</span>
      </div>

      <div className="hidden flex-1 md:block">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="h-9 pl-8 bg-muted/50 border-0" />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} className="text-muted-foreground">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <span className="hidden text-sm font-medium md:inline">{user?.name || "Admin"}</span>
        </div>
      </div>
    </header>
  );
}
