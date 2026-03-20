import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getMyDetails } from "@/api/tenant.api";
import { DashboardCard } from "@/components/DashboardCard";
import { PageLoader } from "@/components/Loader";
import { BedDouble, IndianRupee, AlertCircle, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getMyBills } from "@/api/billing.api";

export default function TenantDashboard() {
    const { data: tenantData, isLoading: loadingTenant } = useQuery({
        queryKey: ["tenant-me"],
        queryFn: getMyDetails,
        select: (res: any) => res.data
    });

    const { data: billsData, isLoading: loadingBills } = useQuery({
        queryKey: ["my-bills"],
        queryFn: getMyBills,
        select: (res: any) => res.data
    });

    if (loadingTenant || loadingBills) return <PageLoader />;

    const tenant = tenantData;
    const bills = billsData || [];
    const latestBill = bills[0];
    const isRentPending = latestBill?.status === "pending" || latestBill?.status === "unpaid";

    const getNextDueDate = () => {
        if (!tenant?.checkInDate) return "N/A";

        const today = new Date();
        const checkIn = new Date(tenant.checkInDate);
        const dueDay = checkIn.getDate();

        let nextDue = new Date(
            today.getFullYear(),
            today.getMonth(),
            dueDay
        );

        if (today > nextDue) {
            nextDue = new Date(
                today.getFullYear(),
                today.getMonth() + 1,
                dueDay
            );
        }

        return nextDue.toLocaleDateString();
    };

    return (
        <div className="space-y-10 pb-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tighter sm:text-5xl">
                    Hello, <span className="text-primary italic">{tenant?.name}!</span>
                </h1>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-lg">
                    Welcome back to your dashboard. Here's what's happening today.
                </p>
            </div>

            {isRentPending && (
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <Alert className="border-none bg-red-500 text-white rounded-[2.5rem] p-8 shadow-xl shadow-red-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-20 blur-2xl" />
                        <AlertCircle className="h-6 w-6 text-white shrink-0" />
                        <div className="ml-4">
                            <AlertTitle className="text-xl font-black tracking-tight mb-1">Rent Payment Pending!</AlertTitle>
                            <AlertDescription className="text-white/90 font-medium text-base">
                                Your rent for <span className="font-black decoration-white/20 underline underline-offset-4">{latestBill?.month}</span> is currently pending. Please complete payment to avoid late fees.
                            </AlertDescription>
                        </div>
                    </Alert>
                </motion.div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <DashboardCard
                    title="Room & Status"
                    value={tenant?.roomId?.roomNumber || "N/A"}
                    icon={BedDouble}
                />
                <DashboardCard
                    title="Monthly Rent"
                    value={`₹${tenant?.roomId?.rentAmount?.toLocaleString() || "0"}`}
                    icon={IndianRupee}
                />
                <DashboardCard
                    title="Payment"
                    value={
                        <span className={isRentPending ? "text-red-500" : "text-green-500"}>
                            {isRentPending ? "NOT PAID" : "PAID ✅"}
                        </span>
                    }
                    icon={AlertCircle}
                />
                <DashboardCard
                    title="Next Due Date"
                    value={getNextDueDate()}
                    icon={Calendar}
                />
            </div>

            {/* Details Section */}
            <div className="rounded-[3rem] border border-border/50 bg-card/40 backdrop-blur-xl p-8 md:p-12 shadow-sm">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    <h3 className="font-black text-2xl tracking-tight italic">Stay <span className="not-italic">Details</span></h3>
                </div>

                <div className="grid gap-10 md:grid-cols-3">
                    <div className="space-y-3 p-6 rounded-[2rem] bg-muted/30 border border-transparent hover:border-primary/20 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Check-in Date</p>
                        <p className="text-xl font-black">{tenant?.checkInDate ? new Date(tenant.checkInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}</p>
                    </div>
                    <div className="space-y-3 p-6 rounded-[2rem] bg-muted/30 border border-transparent hover:border-primary/20 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Joined Phone</p>
                        <p className="text-xl font-black">{tenant?.phone}</p>
                    </div>
                    <div className="space-y-3 p-6 rounded-[2rem] bg-muted/30 border border-transparent hover:border-primary/20 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Room Style</p>
                        <p className="text-xl font-black capitalize">{tenant?.roomId?.roomType || "Standard"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
