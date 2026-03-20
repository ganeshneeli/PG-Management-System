import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useEffect, lazy, Suspense } from "react";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { PageLoader } from "@/components/Loader";
import { useSocketSync } from "@/hooks/useSocketSync";

// Lazy Loaded Pages for performance
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const AdminLoginPage = lazy(() => import("@/pages/AdminLoginPage"));
const TenantLoginPage = lazy(() => import("@/pages/TenantLoginPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const RoomsPage = lazy(() => import("@/pages/RoomsPage"));
const TenantsPage = lazy(() => import("@/pages/TenantsPage"));
const BillingPage = lazy(() => import("@/pages/BillingPage"));
const FoodMenuPage = lazy(() => import("@/pages/FoodMenuPage"));
const ComplaintsPage = lazy(() => import("@/pages/ComplaintsPage"));
const ExpensesPage = lazy(() => import("./pages/ExpensesPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const VisitorsPage = lazy(() => import("@/pages/VisitorsPage"));
const PublicFoodMenu = lazy(() => import("@/pages/PublicFoodMenu"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const TenantDashboard = lazy(() => import("@/pages/TenantDashboard"));
const TenantBills = lazy(() => import("@/pages/TenantBills"));
const TenantMenu = lazy(() => import("@/pages/TenantMenu"));
const TenantComplaints = lazy(() => import("@/pages/TenantComplaints"));
const TenantNotifications = lazy(() => import("@/pages/TenantNotifications"));
const TenantSupport = lazy(() => import("@/pages/TenantSupport"));

const rootQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60, // 1 minute stale time
      gcTime: 1000 * 60 * 10, // 10 minutes cache time
    }
  },
});

const App = () => {
  const { user, isAuthenticated } = useAuthStore();
  const theme = useThemeStore((s) => s.theme);

  // Custom hook for socket synchronization
  useSocketSync(user, isAuthenticated, rootQueryClient);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={rootQueryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><PageLoader /></div>}>
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
                  <Route path="/expenses" element={<ExpensesPage />} />
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
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
