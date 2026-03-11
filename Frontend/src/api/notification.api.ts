import api from "./axios";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  createdAt: string;
}

export const getNotifications = async () => {
  const { data } = await api.get("/notifications");
  return data;
};

export const markAsRead = async (id: string) => {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await api.put("/notifications/read-all");
  return data;
};

export const sendBroadcastAlert = async (alert: { title: string; message: string; type: string }) => {
  const { data } = await api.post("/notifications/broadcast-alert", alert);
  return data;
};
