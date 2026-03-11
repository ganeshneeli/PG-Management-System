import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

import React from "react";

interface DashboardCardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function DashboardCard({ title, value, icon: Icon, description, trend, className }: DashboardCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] border bg-gradient-to-br from-card to-card/50 p-7 shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:opacity-0 hover:before:opacity-100",
        className
      )}
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{title}</p>
          <p className="text-3xl font-black tracking-tighter">{value}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 p-4 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 relative z-10">
        {trend && (
          <div className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
            trend.positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}>
            {trend.positive ? "↑" : "↓"} {trend.value}%
          </div>
        )}
        {description && <p className="text-xs font-medium text-muted-foreground">{description}</p>}
      </div>
    </motion.div>
  );
}
