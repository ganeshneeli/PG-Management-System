import { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BedDouble, Loader2, Mail, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated && user) {
        return <Navigate to={user.role === "admin" ? "/dashboard" : "/tenant/dashboard"} replace />;
    }
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

    const mutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            if (data.user.role !== "admin") {
                toast.error("This portal is for administrators only.");
                return;
            }
            setAuth(data.token, data.user);
            toast.success("Welcome back, Admin!");
            navigate("/dashboard");
        },
        onError: (error: any) => {
            if (!error.response) {
                toast.error("Network Error: Could not connect to the Backend.");
            } else {
                toast.error(error.response?.data?.message || "Invalid admin credentials.");
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please fill in all fields.");
            return;
        }
        mutation.mutate({ email, password } as any);
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-1 flex-col items-center justify-center p-8">
                <Link to="/" className="absolute left-8 top-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Home
                </Link>

                <div className="w-full max-w-sm space-y-8 bg-card p-8 rounded-2xl border shadow-xl">
                    <div className="space-y-2 text-center">
                        <div className="mb-6 flex items-center justify-center gap-2">
                            <BedDouble className="h-8 w-8 text-primary" />
                            <span className="text-2xl font-bold">Modern PG</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Admin Portal</h2>
                        <p className="text-sm text-muted-foreground">Sign in to manage your property</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@pg.com"
                                    className="pl-10 h-11"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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

                        <Button type="submit" className="w-full h-11 text-lg font-semibold" disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Owner Login
                        </Button>
                    </form>

                    <p className="text-center text-xs text-muted-foreground">
                        Tenant looking for your portal? <Link to="/tenant/login" className="text-primary font-medium hover:underline">Click here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
