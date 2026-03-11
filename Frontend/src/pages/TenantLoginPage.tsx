import { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BedDouble, Loader2, Phone, ArrowLeft } from "lucide-react";

export default function TenantLoginPage() {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated && user) {
        return <Navigate to={user.role === "admin" ? "/dashboard" : "/tenant/dashboard"} replace />;
    }
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

    const mutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            if (data.user.role !== "tenant") {
                toast.error("This portal is for residents only. Please use the Owner Login.");
                return;
            }
            setAuth(data.token, data.user);
            toast.success("Welcome back to your PG!");
            navigate("/tenant/dashboard");
        },
        onError: (error: any) => {
            if (!error.response) {
                toast.error("Network Error: Could not connect to the Backend.");
            } else {
                toast.error(error.response?.data?.message || "Invalid tenant credentials.");
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || !password) {
            toast.error("Please fill in all fields.");
            return;
        }
        mutation.mutate({ phone, password } as any);
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Decorative Left Side */}
            <div className="hidden lg:flex w-1/2 bg-primary items-center justify-center p-12 relative overflow-hidden">
                <div className="relative z-10 text-primary-foreground space-y-6 max-w-md">
                    <div className="flex items-center gap-3">
                        <BedDouble className="h-10 w-10" />
                        <span className="text-3xl font-bold italic">Modern PG</span>
                    </div>
                    <h1 className="text-5xl font-extrabold leading-tight">Your Home,<br />digitized.</h1>
                    <p className="text-xl opacity-80">Track your bills, report issues, and view menus with a single tap.</p>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="flex flex-1 flex-col items-center justify-center p-8 relative">
                <Link to="/" className="absolute left-8 top-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Home
                </Link>

                <div className="w-full max-w-sm space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Tenant Portal</h2>
                        <p className="text-sm text-muted-foreground">Sign in with your registered phone number</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="9876543210"
                                    className="pl-10 h-11"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="h-11"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full h-11 text-lg" disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Tenant Sign In
                        </Button>
                    </form>

                    <div className="p-4 rounded-xl bg-muted/50 border space-y-2">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Owner or Admin?</p>
                        <Button variant="outline" className="w-full text-xs h-8" asChild>
                            <Link to="/admin/login">Go to Owner Portal</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
