import { cn } from "@/lib/utils";

type BadgeVariant = "vacant" | "occupied" | "active" | "inactive" | "paid" | "unpaid" | "partial" | "open" | "in-progress" | "resolved" | "low" | "medium" | "high" | "pending";

const variantStyles: Record<BadgeVariant, string> = {
  vacant: "bg-success/10 text-success border-success/20",
  occupied: "bg-primary/10 text-primary border-primary/20",
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-border",
  paid: "bg-success/10 text-success border-success/20",
  unpaid: "bg-destructive/10 text-destructive border-destructive/20",
  partial: "bg-warning/10 text-warning border-warning/20",
  open: "bg-destructive/10 text-destructive border-destructive/20",
  "in-progress": "bg-warning/10 text-warning border-warning/20",
  resolved: "bg-success/10 text-success border-success/20",
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-warning/10 text-warning border-warning/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-destructive/10 text-destructive border-destructive/20", // Changed visually for better "Not Paid" representation
};

const displayNames: Record<string, string> = {
  "bill-pending": "Not Paid",
};

export function StatusBadge({ status, type, className }: { status: BadgeVariant; type?: "bill" | "complaint" | "room" | "tenant"; className?: string }) {
  const key = type ? `${type}-${status}` : (status as string);
  const displayText = displayNames[key] || status;
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
      variantStyles[status] || "bg-muted text-muted-foreground",
      className
    )}>
      {displayText}
    </span>
  );
}
