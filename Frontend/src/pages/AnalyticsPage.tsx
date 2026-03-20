import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/api/analytics.api";
import { DashboardCard } from "@/components/DashboardCard";
import { BarChart3, BedDouble, Users, IndianRupee } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedCounter } from "@/components/AnimatedCounter";

const GlassTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-morphism rounded-xl border border-white/20 p-4 shadow-2xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-lg font-black text-primary" style={{ color: entry.color }}>
            {entry.name === 'revenue' ? `₹${entry.value.toLocaleString()}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardData });

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[2.5rem]" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tighter">Analytics</h1>
        <p className="text-sm font-medium text-muted-foreground">Detailed insights into your PG operations</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total Rooms" value={<AnimatedCounter value={stats.totalRooms} />} icon={BedDouble} />
        <DashboardCard title="Tenants" value={<AnimatedCounter value={stats.totalTenants} />} icon={Users} />
        <DashboardCard title="Revenue" value={<AnimatedCounter value={stats.monthlyRevenue / 1000} prefix="₹" suffix="K" />} icon={IndianRupee} />
        <DashboardCard title="Occupancy Rate" value={<AnimatedCounter value={occupancyRate} suffix="%" />} icon={BarChart3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card/50 p-6 shadow-sm backdrop-blur-sm">
          <h3 className="mb-6 font-bold tracking-tight">Revenue Trend</h3>
          {stats.revenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.revenueChart}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip content={<GlassTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">No revenue history available</div>
          )}
        </div>

        <div className="rounded-2xl border bg-card/50 p-6 shadow-sm backdrop-blur-sm">
          <h3 className="mb-6 font-bold tracking-tight">Room Occupancy</h3>
          {stats.occupancyChart.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.occupancyChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  <Cell fill="hsl(var(--primary))" />
                  <Cell fill="hsl(var(--success))" />
                </Pie>
                <Tooltip content={<GlassTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">No occupancy data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
