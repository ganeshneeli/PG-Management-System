import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { connectSocket, socket, disconnectSocket } from "@/api/socket";
import { useNotificationStore } from "@/store/notificationStore";

export const useSocketSync = (user: any, isAuthenticated: boolean, queryClient: QueryClient) => {
  const incrementUnread = useNotificationStore((s) => s.increment);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("[Socket] Connecting for user:", user._id);
      connectSocket(user._id);

      // Connection Status Listeners
      const onConnect = () => {
        console.log("[Socket] Connected ✅");
      };

      const onDisconnect = (reason: string) => {
        console.log("[Socket] Disconnected ❌", reason);
        if (reason === "io server disconnect") {
          // the disconnection was initiated by the server, you need to reconnect manually
          socket.connect();
        }
      };

      const onConnectError = (err: any) => {
        console.error("[Socket] Connection Error:", err.message);
        toast.error("Live Sync Lost", { 
          description: "Real-time updates are temporarily unavailable.",
          duration: 4000
        });
      };

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("connect_error", onConnectError);

      // Business Logic Listeners
      const onNewBill = (data: any) => {
        toast.info("New Bill Generated", { description: data.message || "A new bill has been created." });
      };

      const onNewComplaint = (data: any) => {
        toast.warning("New Complaint", { description: data.message || "A new complaint has been filed." });
        incrementUnread();
      };

      const onNotification = (data: any) => {
        toast(data.title || "New Notification", { description: data.message });
        incrementUnread();
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      };

      const onDashboardUpdate = () => {
        console.log("[Socket] Syncing dashboard...");
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      };

      const onSyncBills = () => {
        console.log("[Socket] Syncing bills...");
        queryClient.invalidateQueries({ queryKey: ["bills"] });
        queryClient.invalidateQueries({ queryKey: ["my-bills"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["tenant-me"] });
        queryClient.invalidateQueries({ queryKey: ["rooms"] });
      };

      const onSyncRooms = () => {
        console.log("[Socket] Syncing rooms...");
        queryClient.invalidateQueries({ queryKey: ["rooms"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["tenants"] });
      };

      const onSyncTenants = () => {
        console.log("[Socket] Syncing tenants...");
        queryClient.invalidateQueries({ queryKey: ["tenants"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["tenant-me"] });
      };

      const onSyncVisitors = () => {
        console.log("[Socket] Syncing visitors...");
        queryClient.invalidateQueries({ queryKey: ["visitorLogs"] });
        queryClient.invalidateQueries({ queryKey: ["my-visitor-logs"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      };

      const onSyncComplaints = () => {
        console.log("[Socket] Syncing complaints...");
        queryClient.invalidateQueries({ queryKey: ["complaints"] });
        queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      };

      const onSyncMenu = () => {
        console.log("[Socket] Syncing menu...");
        queryClient.invalidateQueries({ queryKey: ["menu"] });
        queryClient.invalidateQueries({ queryKey: ["food-menu"] });
        queryClient.invalidateQueries({ queryKey: ["public-menu"] });
      };

      socket.on("new-bill", onNewBill);
      socket.on("new-complaint", onNewComplaint);
      socket.on("new-notification", onNotification);
      socket.on("notification", onNotification);
      socket.on("dashboard_update", onDashboardUpdate);
      socket.on("sync_bills", onSyncBills);
      socket.on("sync_rooms", onSyncRooms);
      socket.on("sync_tenants", onSyncTenants);
      socket.on("sync_visitors", onSyncVisitors);
      socket.on("sync_complaints", onSyncComplaints);
      socket.on("sync_menu", onSyncMenu);

      return () => {
        console.log("[Socket] Cleaning up listeners...");
        socket.off("new-bill", onNewBill);
        socket.off("new-complaint", onNewComplaint);
        socket.off("new-notification", onNotification);
        socket.off("notification", onNotification);
        socket.off("dashboard_update", onDashboardUpdate);
        socket.off("sync_bills", onSyncBills);
        socket.off("sync_rooms", onSyncRooms);
        socket.off("sync_tenants", onSyncTenants);
        socket.off("sync_visitors", onSyncVisitors);
        socket.off("sync_complaints", onSyncComplaints);
        socket.off("sync_menu", onSyncMenu);
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("connect_error", onConnectError);
      };
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, user, queryClient, incrementUnread]);
};
