import {
  LayoutDashboard, BedDouble, Users, Receipt,
  UtensilsCrossed, MessageSquareWarning,
  Bell, BarChart3, Settings, LogOut, Phone, Sparkles
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const adminItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Rooms", url: "/rooms", icon: BedDouble },
  { title: "Billing", url: "/billing", icon: Receipt },
  { title: "Food Menu", url: "/food-menu", icon: UtensilsCrossed },
  { title: "Complaints", url: "/complaints", icon: MessageSquareWarning },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

const tenantItems = [
  { title: "My Dashboard", url: "/tenant/dashboard", icon: LayoutDashboard },
  { title: "My Bills", url: "/tenant/bills", icon: Receipt },
  { title: "Food Menu", url: "/tenant/menu", icon: UtensilsCrossed },
  { title: "My Complaints", url: "/tenant/complaints", icon: MessageSquareWarning },
  { title: "Notifications", url: "/tenant/notifications", icon: Bell },
  { title: "Contact PG Manager", url: "/tenant/support", icon: Phone },
];

export function AppSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const items = user?.role === "admin" ? adminItems : tenantItems;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-transparent">
      <div className="absolute inset-0 bg-sidebar-background/80 backdrop-blur-xl -z-10" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 py-10 transition-all duration-300">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight text-white">
                    MODERN PG
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    {user?.role === "admin" ? "Admin Panel" : "Resident Portal"}
                  </span>
                </div>
              </motion.div>
            )}
            {collapsed && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
            )}
          </SidebarGroupLabel>

          <SidebarGroupContent className="px-2">
            <SidebarMenu className="gap-1">
              {items.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                    <NavLink
                      to={item.url}
                      end={item.url.includes("dashboard")}
                      onClick={handleNavClick}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-4 py-6 transition-all duration-300",
                        "hover:bg-primary/10 hover:text-primary"
                      )}
                      activeClassName="bg-primary/15 text-primary before:absolute before:left-0 before:h-6 before:w-1 before:rounded-full before:bg-primary"
                    >
                      <item.icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                      {!collapsed && <span className="font-semibold">{item.title}</span>}
                      {collapsed && <span className="sr-only">{item.title}</span>}
                    </NavLink>

                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <SidebarMenuButton
                onClick={handleLogout}
                className="flex h-12 w-full items-center gap-3 rounded-xl bg-destructive/10 px-4 text-destructive transition-all hover:bg-destructive hover:text-white"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="font-bold">Logout</span>}
              </SidebarMenuButton>
            </motion.div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
