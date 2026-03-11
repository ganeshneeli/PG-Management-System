import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDashboardData } from "@/api/analytics.api";
import { DashboardCard } from "@/components/DashboardCard";
import { PageLoader } from "@/components/Loader";
import { BedDouble, Users, DoorOpen, IndianRupee, AlertCircle, TrendingUp, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { sendBroadcastAlert } from "@/api/notification.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, MessageSquareWarning, Clock, ChevronRight, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

const COLORS = ["hsl(230, 80%, 56%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)"];

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
  });

  const [broadcast, setBroadcast] = useState({ title: "", message: "", type: "alert" });
  const [loading, setLoading] = useState(false);



  const handleBroadcast = async () => {
    if (!broadcast.title || !broadcast.message) return toast.error("Please fill all fields");
    setLoading(true);
    try {
      await sendBroadcastAlert(broadcast);
      toast.success("Broadcast alert sent successfully!");
      setBroadcast({ title: "", message: "", type: "alert" });
    } catch (err) {
      toast.error("Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  const queryClient = useQueryClient();

  if (isLoading) return <PageLoader />;

  const dashboard = data || {
    totalRooms: 0, occupiedRooms: 0, vacantRooms: 0, totalTenants: 0,
    monthlyRevenue: 0, totalRevenue: 0, collectedRevenue: 0, pendingRevenue: 0,
    pendingPayments: 0,
    totalComplaints: 0, pendingComplaints: 0,
    totalVisitorRequests: 0, pendingVisitorRequests: 0,
    recentVisitors: [],
    recentComplaints: [],
    revenueChart: [],
    occupancyChart: [],
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tighter sm:text-4xl">Dashboard</h1>
        <p className="text-muted-foreground font-medium">Overview of your PG operations</p>
        {error && <p className="mt-1 text-xs text-warning">Backend connection error — data may be outdated</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <DashboardCard title="Total Rooms" value={dashboard.totalRooms} icon={BedDouble} />
        <DashboardCard title="Occupied" value={dashboard.occupiedRooms} icon={DoorOpen} />
        <DashboardCard title="Vacant" value={dashboard.vacantRooms} icon={BedDouble} />
        <DashboardCard title="Pending Bills" value={dashboard.pendingPayments} icon={AlertCircle} />
        <DashboardCard title="Total Revenue" value={`₹${((dashboard.totalRevenue || 0) / 1000).toFixed(1)}K`} icon={IndianRupee} />
      </div>

      {/* Revenue Breakdown */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <IndianRupee className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-black">₹{((dashboard.totalRevenue || 0)).toLocaleString()}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
            <IndianRupee className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Collected</p>
            <p className="text-2xl font-black text-green-500">₹{((dashboard.collectedRevenue || 0)).toLocaleString()}</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Pending</p>
            <p className="text-2xl font-black text-red-500">₹{((dashboard.pendingRevenue || 0)).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="col-span-2 rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Revenue Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dashboard.revenueChart}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(220, 9%, 46%)" }} />
              <YAxis className="text-xs" tick={{ fill: "hsl(220, 9%, 46%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(230, 80%, 56%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy Chart */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Room Occupancy</h3>
          {dashboard.occupancyChart.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={dashboard.occupancyChart} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {dashboard.occupancyChart.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">No data available</div>
          )}
        </div>
      </div>





      {/* Quick Broadcast Section */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-sidebar-primary" />
          <h3 className="font-semibold">Quick Broadcast (Festival Alerts / Offers)</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-4 items-end">
          <div className="grid gap-2">
            <Label>Alert Title</Label>
            <Input placeholder="e.g. Diwali Special Offer" value={broadcast.title} onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })} />
          </div>
          <div className="md:col-span-2 grid gap-2">
            <Label>Message</Label>
            <Input placeholder="Details of the festival offer or alert..." value={broadcast.message} onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Button onClick={handleBroadcast} disabled={loading}>{loading ? "Sending..." : "Send Alert"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
