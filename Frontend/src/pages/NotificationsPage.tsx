import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAsRead, markAllAsRead, Notification } from "@/api/notification.api";
import { Button } from "@/components/ui/button";
import { TableLoader } from "@/components/Loader";
import { toast } from "sonner";
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notificationStore";
import { useEffect } from "react";

const typeIcons = { info: Info, warning: AlertTriangle, success: CheckCircle, error: XCircle } as const;
const typeColors = { info: "text-primary", warning: "text-warning", success: "text-success", error: "text-destructive" } as const;

export default function NotificationsPage() {
  const qc = useQueryClient();
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    select: (res) => (res.data || []).map((n: any) => ({ ...n, read: n.isRead ?? n.read ?? false }))
  });
  const notifications: Notification[] = data || [];

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications, setUnreadCount]);

  const readMut = useMutation({ mutationFn: markAsRead, onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });
  const readAllMut = useMutation({ mutationFn: markAllAsRead, onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); toast.success("All marked as read"); } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">{notifications.filter((n) => !n.read).length} unread</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => readAllMut.mutate()}>
          <CheckCheck className="mr-2 h-4 w-4" />Mark all read
        </Button>
      </div>

      {isLoading && !error ? <TableLoader /> : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <div
                key={n._id}
                onClick={() => !n.read && readMut.mutate(n._id)}
                className={cn(
                  "flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50",
                  !n.read && "border-primary/20 bg-primary/5"
                )}
              >
                <div className={cn("mt-0.5 rounded-lg p-2", !n.read ? "bg-primary/10" : "bg-muted")}>
                  <Icon className={cn("h-4 w-4", typeColors[n.type])} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={cn("text-sm font-medium", !n.read && "font-semibold")}>{n.title}</p>
                    <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                </div>
                {!n.read && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </div>
            );
          })}
          {notifications.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Bell className="mx-auto mb-3 h-8 w-8" />
              <p>No notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
