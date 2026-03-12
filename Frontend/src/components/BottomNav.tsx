import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  BedDouble, 
  Receipt, 
  MessageSquareWarning, 
  User,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

export function BottomNav() {
  const { user } = useAuthStore();
  
  const adminItems = [
    { title: "Home", url: "/dashboard", icon: LayoutDashboard },
    { title: "Rooms", url: "/rooms", icon: BedDouble },
    { title: "Billing", url: "/billing", icon: Receipt },
    { title: "Complaints", url: "/complaints", icon: MessageSquareWarning },
  ];

  const tenantItems = [
    { title: "Home", url: "/tenant/dashboard", icon: LayoutDashboard },
    { title: "Bills", url: "/tenant/bills", icon: Receipt },
    { title: "Menu", url: "/tenant/menu", icon: UtensilsCrossed },
    { title: "Support", url: "/tenant/support", icon: Phone },
  ];

  // For BottomNav, we'll use a simplified set to keep it clean (max 5 items)
  const items = user?.role === "admin" 
    ? [
        { title: "Home", url: "/dashboard", icon: LayoutDashboard },
        { title: "Rooms", url: "/rooms", icon: BedDouble },
        { title: "Billing", url: "/billing", icon: Receipt },
        { title: "Expenses", url: "/expenses", icon: Wallet },
        { title: "Alerts", url: "/complaints", icon: MessageSquareWarning },
      ]
    : [
        { title: "Home", url: "/tenant/dashboard", icon: LayoutDashboard },
        { title: "Bills", url: "/tenant/bills", icon: Receipt },
        { title: "Menu", url: "/tenant/menu", icon: UtensilsCrossed },
        { title: "Support", url: "/tenant/support", icon: Phone },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/80 px-4 pb-safe backdrop-blur-xl md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.url}
          to={item.url}
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 transition-all duration-300",
            isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
          )}
        >
          <item.icon className="h-6 w-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.title}</span>
        </NavLink>
      ))}
    </nav>
  );
}

// Helper icons that were missing in the imports but used in tenantItems
function UtensilsCrossed(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" />
      <path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3" />
      <path d="m2 22 10.1-10.1" />
      <path d="m22 22-5-5" />
    </svg>
  );
}

function Phone(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
