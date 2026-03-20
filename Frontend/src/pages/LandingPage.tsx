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
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <BedDouble className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter">LAKSHMI PUJITHA LADIES PG</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Amenities</a>
            <a href="#rooms" className="hover:text-primary transition-colors">Rooms</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:flex font-bold hover:bg-primary/10 hover:text-primary">
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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-[120px] -z-10" />
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary text-xs font-black uppercase tracking-[0.2em]"
              >
                <Sparkles className="h-4 w-4" /> Pavan Kumar & Lakshmi Pujitha
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]"
              >
                Lakshmi Pujitha<br />
                <span className="text-primary italic">LADIES PG</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl text-primary font-black uppercase tracking-widest"
              >
                Luxury Rooms Available
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
              >
                <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-2xl shadow-primary/40 font-black" asChild>
                  <Link to="/tenant/login">Book Your Room <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <div className="flex flex-col items-start gap-1 px-8">
                  <div className="flex items-center gap-2 text-xl font-black text-primary">
                    <Phone className="h-5 w-5" />
                    7989868757
                  </div>
                  <div className="flex items-center gap-2 text-xl font-black text-primary pl-7">
                    9573171253
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 bg-card outline outline-1 outline-primary/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black tracking-tighter mb-4">Top-Class <span className="text-primary italic">Amenities</span></h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Biometric Entry", desc: "Advanced security with fingerprint access for residents.", icon: Zap },
                { title: "Lift Facility", desc: "Easy access to all floors with modern elevator systems.", icon: ArrowRight },
                { title: "CCTV Surveillance", desc: "24/7 monitoring for your complete safety and peace of mind.", icon: CheckCircle2 },
                { title: "Self Cooking", desc: "Well-equipped kitchen space for those who love to cook.", icon: Utensils },
                { title: "Attached Bathroom", desc: "Private, clean, and modern bathrooms in every room.", icon: BedDouble },
                { title: "Homely Food", desc: "Delicious, nutritious meals served in a clean environment.", icon: Utensils },
                { title: "WiFi", desc: "High-speed internet connectivity across the entire premises.", icon: Wifi },
                { title: "24/7 Water", desc: "Uninterrupted hot and cold water supply round the clock.", icon: Zap },
                { title: "Nearby IT Companies", desc: "Prime location close to major IT hubs and companies.", icon: MapPin },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-3xl bg-background border border-primary/10 transition-all hover:shadow-2xl hover:shadow-primary/5"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-6">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black mb-2">{f.title}</h3>
                  <p className="text-muted-foreground font-medium text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Rooms Grid */}
        <section id="rooms" className="py-24 relative overflow-hidden bg-background">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="space-y-4">
                <h2 className="text-5xl font-black tracking-tighter">Available <span className="text-primary italic">Units</span></h2>
                <p className="text-xl text-muted-foreground font-medium max-w-xl">
                  Luxury living spaces specifically designed for women.
                </p>
              </div>
              <Button variant="ghost" className="font-bold text-primary hover:bg-primary/10">Explore All <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: "Luxury Single", price: "15,000", type: "Single Sharing", image: "/assets/rooms/single.png" },
                { name: "Premium Double", price: "10,000", type: "Double Sharing", image: "/assets/rooms/double.png" },
                { name: "Elite Triple", price: "8,000", type: "Triple Sharing", image: "/assets/rooms/triple.png" }
              ].map((room) => (
                <motion.div
                  key={room.name}
                  whileHover={{ scale: 1.02 }}
                  className="group relative h-[450px] rounded-[3rem] overflow-hidden bg-muted/30 border border-primary/5"
                >
                  <img
                    src={room.image}
                    alt={room.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 p-10 w-full space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-primary-foreground/80 text-xs font-black uppercase tracking-widest">{room.type}</p>
                        <h3 className="text-3xl font-black text-white">{room.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-primary font-black text-2xl">₹{room.price}</p>
                        <p className="text-white/60 text-[10px] font-bold">/ Month</p>
                      </div>
                    </div>
                    <Button className="w-full h-12 rounded-full bg-white text-primary hover:bg-primary hover:text-white font-black shadow-lg">Book Now</Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* CTA Section */}
      <section className="bg-primary py-24 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
        <div className="container mx-auto px-6 text-center space-y-8 relative z-10">
          <h2 className="text-5xl font-black tracking-tighter">Ready to Experience Premium Living?</h2>
          <p className="text-xl font-medium opacity-90 max-w-2xl mx-auto">
            Contact us today for a tour or book your room online.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3 bg-white/10 px-6 py-4 rounded-full backdrop-blur-md border border-white/20">
                <Phone className="h-6 w-6" />
                <span className="text-2xl font-black">7989868757</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3 bg-white/10 px-6 py-4 rounded-full backdrop-blur-md border border-white/20">
                <Phone className="h-6 w-6" />
                <span className="text-2xl font-black">9573171253</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="contact" className="bg-[#11081f] pt-20 text-white">
        <div className="container mx-auto px-6 border-b border-white/5 pb-20">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <BedDouble className="h-8 w-8 text-primary" />
                <span className="text-2xl font-black leading-tight">LAKSHMI PUJITHA<br />LADIES PG</span>
              </div>
              <p className="text-slate-400 font-medium">
                Luxury accommodation for women, providing a safe, clean, and premium living environment.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-primary">Quick Links</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                <li><a href="#features" className="hover:text-primary transition-colors">Amenities</a></li>
                <li><a href="#rooms" className="hover:text-primary transition-colors">Available Rooms</a></li>
                <li><Link to="/tenant/login" className="hover:text-primary transition-colors">Resident Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-primary">Connect</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                <li className="font-bold text-white">Pavan Kumar</li>
                <li className="font-bold text-white">Lakshmi Pujitha</li>
                <li className="flex items-center gap-2 font-bold text-primary">+91 7989868757</li>
                <li className="flex items-center gap-2 font-bold text-primary">+91 9573171253</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-primary">Location</h4>
              <ul className="space-y-4 text-slate-400 font-medium">
                <li className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-1" />
                  <span>#16, Manjunatha Layout,<br />Munnekollala Main Road,<br />Marathahalli, Bangalore - 560037</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Fingrow Branded Footer */}
        <div className="py-12 text-center flex flex-col items-center gap-6 bg-black/40">
          {/* Logo */}
          <img
            src="/fingrow-logo.png"
            alt="Fingrow Consulting Services"
            loading="lazy"
            className="w-40 object-contain opacity-80"
          />

          {/* Copyright */}
          <div className="text-white/60 text-sm leading-relaxed">
            <p>© 2026 Fingrow Consulting Services Pvt Ltd. All rights reserved.</p>
            <p className="text-white/40">
              PG Management System developed by Fingrow Technology Team.
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-1 text-white/50 text-sm">
            <p>
              📞 <span className="font-medium">Call / WhatsApp:</span>{" "}
              <a href="tel:+919550756797" className="hover:text-white">
                +91 9550756797
              </a>{" "}
              /{" "}
              <a href="tel:+919187135171" className="hover:text-white">
                +91 9187135171
              </a>
            </p>
            <p>
              📧 <span className="font-medium">Email Us:</span>{" "}
              <a href="mailto:contact@fingrow.in" className="hover:text-white">
                contact@fingrow.in
              </a>{" "}
              |{" "}
              <a href="mailto:harish.m@fingrow.in" className="hover:text-white">
                Lokesh.vasu@fingrow.in
              </a>
            </p>
            <p>
              📧 <span className="font-medium">Email Us:</span>{" "}
              <a href="mailto:contact@fingrow.in" className="hover:text-white">
                contact@fingrow.in
              </a>{" "}
              |{" "}
              <a href="mailto:harish.m@fingrow.in" className="hover:text-white">
                harish.m@fingrow.in
              </a>
            </p>
          </div>
          <div className="flex gap-6 text-sm text-white/40">
            <a
              href="https://www.linkedin.com/company/fingrowconsulting/posts/?feedView=all"
              target="_blank"
              className="hover:text-white"
            >
              🔗 LinkedIn
            </a>

            <a
              href="https://www.instagram.com/fingrow_technologies?igsh=MWJheXlybjR6MjFhOA%3D%3D"
              target="_blank"
              className="hover:text-white"
            >
              📸 Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
