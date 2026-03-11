import api from "./axios";

export interface Bill {
  _id: string;
  tenantId: any;
  roomId: any;
  tenantName?: string;
  roomNumber?: string;
  amount: number;
  electricity?: number;
  extraCharges?: number;
  month: string;
  year: number;
  status: "paid" | "pending" | "unpaid" | "partial";
  paidAmount?: number;
  dueDate?: string;
  paidDate?: string;
  createdAt: string;
}

export const getBills = async () => {
  const { data } = await api.get("/bills");
  return data;
};

export const generateBills = async () => {
  const { data } = await api.post("/bills/generate-monthly");
  return data;
};

export const updatePaymentStatus = async (id: string, paymentData: { status: string; paidAmount?: number }) => {
  const { data } = await api.put(`/bills/payment-update/${id}`, paymentData);
  return data;
};

export const resendBillReminder = async (id: string) => {
  const { data } = await api.post(`/bills/${id}/resend-reminder`);
  return data;
};

export const remindRoomUnpaid = async (roomId: string, month: string) => {
  const { data } = await api.post("/bills/room-remind", { roomId, month });
  return data;
};

export const remindAllUnpaid = async () => {
  const { data } = await api.post("/bills/remind-all");
  return data;
};

export const cleanupDuplicates = async () => {
  const { data } = await api.post("/bills/cleanup-duplicates");
  return data;
};

export const getMyBills = async () => {
  const { data } = await api.get("/bills/my-bills");
  return data;
};

export const downloadBill = async (id: string) => {
  const response = await api.get(`/bills/${id}/download`, {
    responseType: "blob",
  });
  return response.data;
};
