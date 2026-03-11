import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/api/analytics.api";
import { DashboardCard } from "@/components/DashboardCard";
import { PageLoader } from "@/components/Loader";
import { BarChart3, BedDouble, Users, IndianRupee } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardData });

  if (isLoading) return <PageLoader />;

  const stats = data || {
    totalRooms: 0,
    occupiedRooms: 0,
    totalTenants: 0,
    monthlyRevenue: 0,
    revenueChart: [],
    occupancyChart: []
  };

  const occupancyRate = stats.totalRooms > 0
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Detailed insights into your PG operations</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total Rooms" value={stats.totalRooms} icon={BedDouble} />
        <DashboardCard title="Tenants" value={stats.totalTenants} icon={Users} />
        <DashboardCard title="Revenue" value={`₹${(stats.monthlyRevenue / 1000).toFixed(1)}K`} icon={IndianRupee} />
        <DashboardCard title="Occupancy Rate" value={`${occupancyRate}%`} icon={BarChart3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Revenue Trend</h3>
          {stats.revenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: "hsl(220, 9%, 46%)" }} />
                <YAxis tick={{ fill: "hsl(220, 9%, 46%)" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(230, 80%, 56%)" fill="hsl(230, 80%, 56%)" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">No revenue history available</div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Room Occupancy</h3>
          {stats.occupancyChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.occupancyChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: "hsl(220, 9%, 46%)" }} />
                <YAxis tick={{ fill: "hsl(220, 9%, 46%)" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="occupied" fill="hsl(230, 80%, 56%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vacant" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">No occupancy data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
