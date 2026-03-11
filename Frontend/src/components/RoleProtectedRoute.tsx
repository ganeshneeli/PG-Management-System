import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface RoleProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: ("admin" | "tenant")[];
}

export function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role as "admin" | "tenant")) {
        const redirectPath = user.role === "admin" ? "/dashboard" : "/tenant/dashboard";
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
}
