import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAsRead, markAllAsRead } from "@/api/notification.api";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, Megaphone, PartyPopper, TriangleAlert, Info } from "lucide-react";
import { TableLoader } from "@/components/Loader";
import { toast } from "sonner";
import { useNotificationStore } from "@/store/notificationStore";

const getNotificationStyle = (title: string, type: string) => {
    const t = title.toLowerCase();

    // Festival / Offers
    if (t.includes("diwali") || t.includes("offer") || t.includes("festival") || t.includes("special") || t.includes("party")) {
        return {
            icon: PartyPopper,
            colorClass: "text-amber-500",
            bgClass: "bg-amber-500/10",
            borderClass: "border-amber-500/20"
        };
    }

    // Emergency / Maintenance / Warnings
    if (t.includes("maintenance") || t.includes("emergency") || t.includes("stop") || type === "alert" || t.includes("warning") || t.includes("pending")) {
        return {
            icon: TriangleAlert,
            colorClass: "text-destructive",
            bgClass: "bg-destructive/10",
            borderClass: "border-destructive/20"
        };
    }

    // General Broadcast Announcements
    if (t.includes("announcement") || t.includes("notice") || t.includes("broadcast")) {
        return {
            icon: Megaphone,
            colorClass: "text-blue-500",
            bgClass: "bg-blue-500/10",
            borderClass: "border-blue-500/20"
        };
    }

    // Default System Messages
    return {
        icon: Info,
        colorClass: "text-primary",
        bgClass: "bg-primary/10",
        borderClass: "border-primary/20"
    };
};

export default function TenantNotifications() {
    const qc = useQueryClient();
    const clearUnread = useNotificationStore((s) => s.clear);

    const { data: notifications, isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
        select: (res: any) => res.data
    });

    const markReadMut = useMutation({
        mutationFn: markAsRead,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] })
    });

    const markAllReadMut = useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["notifications"] });
            clearUnread();
            toast.success("All notifications marked as read");
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-sm text-muted-foreground">Stay updated with PG announcements and alerts</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => markAllReadMut.mutate()} disabled={notifications?.length === 0}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Mark all read
                </Button>
            </div>

            {isLoading ? <TableLoader /> : (
                <div className="space-y-4">
                    {notifications?.map((n: any) => {
                        const { icon: Icon, colorClass, bgClass, borderClass } = getNotificationStyle(n.title, n.type);

                        return (
                            <div
                                key={n._id}
                                className={`p-4 rounded-xl border transition-all cursor-pointer ${n.read ? 'bg-muted/20 opacity-70 border-border' : `bg-card shadow-sm ${borderClass}`}`}
                                onClick={() => !n.read && markReadMut.mutate(n._id)}
                            >
                                <div className="flex gap-4">
                                    <div className={`p-2 rounded-full h-fit flex items-center justify-center ${n.read ? 'bg-muted text-muted-foreground' : `${bgClass} ${colorClass}`}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                                            <h3 className={`font-semibold ${n.read ? 'text-muted-foreground' : colorClass}`}>{n.title}</h3>
                                            <span className="text-xs text-muted-foreground font-medium shrink-0">{new Date(n.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{n.message}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {(!notifications || notifications.length === 0) && (
                        <div className="py-20 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                            <Bell className="h-12 w-12 mx-auto mb-4 opacity-10" />
                            <p>No notifications yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
