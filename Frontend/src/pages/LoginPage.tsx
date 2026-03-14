import { Link, Navigate } from "react-router-dom";
import { BedDouble, ShieldCheck, UserCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to={user.role === "admin" ? "/dashboard" : "/tenant/dashboard"} replace />;
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <Link to="/" className="absolute left-8 top-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="w-full max-w-2xl space-y-12 text-center">
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary rounded-2xl shadow-lg ring-4 ring-primary/20">
              <BedDouble className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Welcome to Lakshmi Pujitha LADIES PG</h1>
          <p className="text-xl text-muted-foreground">Select your portal to continue</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 px-4">
          {/* Admin Path */}
          <Link
            to="/admin/login"
            className="group relative flex flex-col items-center p-8 bg-card rounded-3xl border-2 border-transparent hover:border-primary transition-all duration-300 shadow-sm hover:shadow-2xl"
          >
            <div className="h-16 w-16 mb-6 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors ring-8 ring-primary/5">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Management</h2>
            <p className="text-muted-foreground text-sm mb-6">For property owners and administrators to manage rooms and residents.</p>
            <Button className="w-full group-hover:ring-4 group-hover:ring-primary/20">Login as Owner</Button>
          </Link>

          {/* Tenant Path */}
          <Link
            to="/tenant/login"
            className="group relative flex flex-col items-center p-8 bg-card rounded-3xl border-2 border-transparent hover:border-primary transition-all duration-300 shadow-sm hover:shadow-2xl"
          >
            <div className="h-16 w-16 mb-6 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors ring-8 ring-primary/5">
              <UserCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Resident</h2>
            <p className="text-muted-foreground text-sm mb-6">For current residents to pay bills, report issues, and view food menus.</p>
            <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">Login as Tenant</Button>
          </Link>
        </div>

        <div className="pt-8 text-sm text-muted-foreground">
          © 2026 Lakshmi Pujitha LADIES PG. Premium living for urban professionals.
        </div>
      </div>
    </div>
  );
}
