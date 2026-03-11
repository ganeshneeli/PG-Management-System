import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import {
    BedDouble, CheckCircle2, Star,
    Wifi, Utensils, Zap, ArrowRight, Sparkles, Phone, MapPin
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated && user) {
        return <Navigate to={user.role === "admin" ? "/dashboard" : "/tenant/dashboard"} replace />;
    }
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
            {/* Header */}
            <header className="fixed top-0 z-50 w-full border-b bg-white/60 backdrop-blur-xl dark:bg-slate-950/60">
                <div className="container mx-auto flex h-20 items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                            <BedDouble className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter">MODERN PG</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        <a href="#features" className="hover:text-primary transition-colors">Features</a>
                        <a href="#rooms" className="hover:text-primary transition-colors">Rooms</a>
                        <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" asChild className="hidden sm:flex font-bold">
                            <Link to="/tenant/login">Resident Login</Link>
                        </Button>
                        <Button asChild className="rounded-full px-6 shadow-xl shadow-primary/20 font-bold">
                            <Link to="/admin/login">Owner Login</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative pt-40 pb-20 md:pt-60 md:pb-40">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-primary/10 to-transparent blur-[120px] -z-10" />
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto text-center space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em]"
                            >
                                <Sparkles className="h-4 w-4" /> Premium Co-living Experience
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]"
                            >
                                Live Smart.<br />
                                <span className="text-primary italic">Live Premium.</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium"
                            >
                                Discover a new way of living with Modern PG. High-speed internet, premium amenities,
                                and a community of like-minded professionals awaiting you.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
                            >
                                <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-2xl shadow-primary/40 font-black" asChild>
                                    <Link to="/tenant/login">Enter Tenant Portal <ArrowRight className="ml-2 h-5 w-5" /></Link>
                                </Button>
                                <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full border-2 font-black" asChild>
                                    <Link to="/admin/login">Manage My Property</Link>
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="py-24 bg-white dark:bg-slate-900">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-3 gap-12">
                            {[
                                { title: "Ultra Fast WiFi", desc: "1GBPS fiber connection to keep you connected and productive.", icon: Wifi },
                                { title: "Premium Food", desc: "Healthy, diverse menus prepared by professional chefs daily.", icon: Utensils },
                                { title: "Daily Cleaning", desc: "Our staff ensures your room is spotless every single day.", icon: CheckCircle2 },
                            ].map((f, i) => (
                                <motion.div
                                    key={f.title}
                                    whileHover={{ y: -10 }}
                                    className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 border transition-all hover:shadow-2xl hover:shadow-primary/5"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                                        <f.icon className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-2">{f.title}</h3>
                                    <p className="text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Rooms Grid */}
                <section id="rooms" className="py-24 relative overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                            <div className="space-y-4">
                                <h2 className="text-5xl font-black tracking-tighter">Available <span className="text-primary italic">Units</span></h2>
                                <p className="text-xl text-muted-foreground font-medium max-w-xl">
                                    Meticulously designed spaces tailored for modern professionals.
                                </p>
                            </div>
                            <Button variant="ghost" className="font-bold text-primary">View All Rooms <ArrowRight className="ml-2 h-4 w-4" /></Button>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { name: "Studio Deluxe", price: "12,000", type: "Single" },
                                { name: "Executive Suite", price: "8,500", type: "Double Sharing" },
                                { name: "Urban Shared", price: "6,000", type: "Triple Sharing" }
                            ].map((room) => (
                                <motion.div
                                    key={room.name}
                                    whileHover={{ scale: 1.02 }}
                                    className="group relative h-[450px] rounded-[3rem] overflow-hidden bg-slate-200"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute bottom-0 p-10 w-full space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-primary-foreground/60 text-xs font-black uppercase tracking-widest">{room.type}</p>
                                                <h3 className="text-3xl font-black text-white">{room.name}</h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-black text-2xl">₹{room.price}</p>
                                                <p className="text-white/60 text-[10px] font-bold">/ Month</p>
                                            </div>
                                        </div>
                                        <Button className="w-full h-12 rounded-full bg-white text-black hover:bg-primary hover:text-white font-black">Book Now</Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* CTA Section */}
            <section className="bg-primary py-24 text-primary-foreground relative overflow-hidden">
                <div className="container mx-auto px-6 text-center space-y-8 relative z-10">
                    <h2 className="text-5xl font-black tracking-tighter">Ready to Experience the Best PG Living?</h2>
                    <p className="text-xl font-medium opacity-90 max-w-2xl mx-auto">
                        Contact us today for a free tour or book your room online.
                        Join our community of elite professionals.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div className="flex items-center gap-3 bg-white/10 px-6 py-4 rounded-full backdrop-blur-md">
                            <Phone className="h-6 w-6" />
                            <span className="text-xl font-black">+91 98765 43210</span>
                        </div>
                        <Button size="lg" variant="secondary" className="h-16 px-10 rounded-full font-black text-lg">
                            Schedule a Tour
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="bg-slate-900 py-20 text-white">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-20">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <BedDouble className="h-8 w-8 text-primary" />
                                <span className="text-2xl font-black">MODERN PG</span>
                            </div>
                            <p className="text-slate-400 font-medium">
                                Redefining the standard of urban living for professionals across the globe.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-6">Explore</h4>
                            <ul className="space-y-4 text-slate-400 font-medium">
                                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Our PG Locations</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-6">Residents</h4>
                            <ul className="space-y-4 text-slate-400 font-medium">
                                <li><Link to="/tenant/login" className="hover:text-primary transition-colors">Login Portal</Link></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Support Center</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">House Rules</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-6">Contact</h4>
                            <ul className="space-y-4 text-slate-400 font-medium">
                                <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> HSR Layout, Bengaluru</li>
                                <li className="flex items-center gap-2 font-bold">+91 91234 56789</li>
                                <li className="underline text-primary">mgr@modernpg.com</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm font-bold">
                        © 2026 MODERN PG SYSTEM. BUILT FOR PREMIUM LIVING.
                    </div>
                </div>
            </footer>
        </div>
    );
}
