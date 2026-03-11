import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useThemeStore } from "@/store/themeStore";
import { connectSocket, socket, disconnectSocket } from "@/api/socket";
import { useEffect } from "react";
import { toast } from "sonner";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import TenantLoginPage from "@/pages/TenantLoginPage";
import DashboardPage from "@/pages/DashboardPage";
import RoomsPage from "@/pages/RoomsPage";
import TenantsPage from "@/pages/TenantsPage";
import BillingPage from "@/pages/BillingPage";
import FoodMenuPage from "@/pages/FoodMenuPage";
import ComplaintsPage from "@/pages/ComplaintsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import VisitorsPage from "@/pages/VisitorsPage";
import PublicFoodMenu from "@/pages/PublicFoodMenu";
import NotFound from "@/pages/NotFound";
import TenantDashboard from "@/pages/TenantDashboard";
import TenantBills from "@/pages/TenantBills";
import TenantMenu from "@/pages/TenantMenu";
import TenantComplaints from "@/pages/TenantComplaints";
import TenantNotifications from "@/pages/TenantNotifications";
import TenantSupport from "@/pages/TenantSupport";

const rootQueryClient = new QueryClient({
  defaultOptions: { 
    queries: { 
      retry: 1, 
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds stale time to reduce redundant refetches
      gcTime: 1000 * 60 * 5, // 5 minutes cache time (formerly cacheTime)
    } 
  },
});

const App = () => {
  const { user, isAuthenticated } = useAuthStore();
  const incrementUnread = useNotificationStore((s) => s.increment);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("[Socket] Connecting for user:", user._id);
      connectSocket(user._id);

      // Listeners
      const onNewBill = (data: any) => {
        toast.info("New Bill Generated", { description: data.message || "A new bill has been created." });
      };
      const onNewComplaint = (data: any) => {
        toast.warning("New Complaint", { description: data.message || "A new complaint has been filed." });
        incrementUnread();
      };
      const onNotification = (data: any) => {
        toast(data.title || "New Notification", { description: data.message });
        incrementUnread();
        rootQueryClient.invalidateQueries({ queryKey: ["notifications"] });
      };
      const onDashboardUpdate = () => {
        console.log("[Socket] Syncing dashboard...");
        rootQueryClient.invalidateQueries({ queryKey: ["dashboard"] });
      };
      const onSyncBills = () => {
        console.log("[Socket] Syncing bills...");
        rootQueryClient.invalidateQueries({ queryKey: ["bills"] });
        rootQueryClient.invalidateQueries({ queryKey: ["my-bills"] });
        rootQueryClient.invalidateQueries({ queryKey: ["dashboard"] });
        rootQueryClient.invalidateQueries({ queryKey: ["tenant-me"] });
        rootQueryClient.invalidateQueries({ queryKey: ["rooms"] }); // Added: room colors depend on bills
      };
      const onSyncRooms = () => {
        console.log("[Socket] Syncing rooms...");
        rootQueryClient.invalidateQueries({ queryKey: ["rooms"] });
        rootQueryClient.invalidateQueries({ queryKey: ["dashboard"] });
        rootQueryClient.invalidateQueries({ queryKey: ["tenants"] }); // Added: occupants depend on rooms
      };
      const onSyncTenants = () => {
        console.log("[Socket] Syncing tenants...");
        rootQueryClient.invalidateQueries({ queryKey: ["tenants"] });
        rootQueryClient.invalidateQueries({ queryKey: ["dashboard"] });
        rootQueryClient.invalidateQueries({ queryKey: ["tenant-me"] });
      };
      const onSyncVisitors = () => {
        console.log("[Socket] Syncing visitors...");
        rootQueryClient.invalidateQueries({ queryKey: ["visitorLogs"] });
        rootQueryClient.invalidateQueries({ queryKey: ["my-visitor-logs"] });
        rootQueryClient.invalidateQueries({ queryKey: ["dashboard"] });
      };
      const onSyncComplaints = () => {
        console.log("[Socket] Syncing complaints...");
        rootQueryClient.invalidateQueries({ queryKey: ["complaints"] });
        rootQueryClient.invalidateQueries({ queryKey: ["my-complaints"] });
        rootQueryClient.invalidateQueries({ queryKey: ["dashboard"] });
      };
      const onSyncMenu = () => {
        console.log("[Socket] Syncing menu...");
        rootQueryClient.invalidateQueries({ queryKey: ["menu"] });
        rootQueryClient.invalidateQueries({ queryKey: ["food-menu"] });
        rootQueryClient.invalidateQueries({ queryKey: ["public-menu"] });
      };

      socket.on("new-bill", onNewBill);
      socket.on("new-complaint", onNewComplaint);
      socket.on("new-notification", onNotification);
      socket.on("notification", onNotification);
      socket.on("dashboard_update", onDashboardUpdate);
      socket.on("sync_bills", onSyncBills);
      socket.on("sync_rooms", onSyncRooms);
      socket.on("sync_tenants", onSyncTenants);
      socket.on("sync_visitors", onSyncVisitors);
      socket.on("sync_complaints", onSyncComplaints);
      socket.on("sync_menu", onSyncMenu);

      return () => {
        console.log("[Socket] Cleaning up listeners...");
        socket.off("new-bill", onNewBill);
        socket.off("new-complaint", onNewComplaint);
        socket.off("new-notification", onNotification);
        socket.off("notification", onNotification);
        socket.off("dashboard_update", onDashboardUpdate);
        socket.off("sync_bills", onSyncBills);
        socket.off("sync_rooms", onSyncRooms);
        socket.off("sync_tenants", onSyncTenants);
        socket.off("sync_visitors", onSyncVisitors);
        socket.off("sync_complaints", onSyncComplaints);
        socket.off("sync_menu", onSyncMenu);
        // Note: We don't call disconnectSocket() here to keep connection stable across subtle rerenders
        // Only call disconnect on explicit logout or app unload
      };
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, user, incrementUnread]);

  return (
    <QueryClientProvider client={rootQueryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/tenant/login" element={<TenantLoginPage />} />
            <Route path="/public-menu" element={<PublicFoodMenu />} />

            {/* Admin Only Routes */}
            <Route element={<RoleProtectedRoute allowedRoles={["admin"]}><DashboardLayout /></RoleProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/tenants" element={<TenantsPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/food-menu" element={<FoodMenuPage />} />
              <Route path="/complaints" element={<ComplaintsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/visitors" element={<VisitorsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Tenant Only Routes */}
            <Route element={<RoleProtectedRoute allowedRoles={["tenant"]}><DashboardLayout /></RoleProtectedRoute>}>
              <Route path="/tenant/dashboard" element={<TenantDashboard />} />
              <Route path="/tenant/bills" element={<TenantBills />} />
              <Route path="/tenant/menu" element={<TenantMenu />} />
              <Route path="/tenant/complaints" element={<TenantComplaints />} />
              <Route path="/tenant/notifications" element={<TenantNotifications />} />
              <Route path="/tenant/support" element={<TenantSupport />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
