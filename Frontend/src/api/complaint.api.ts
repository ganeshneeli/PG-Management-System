import api from "./axios";

export interface Complaint {
  _id: string;
  tenantId: any;
  tenantName?: string;
  title: string;
  description: string;
  category: "maintenance" | "food" | "cleaning" | "security" | "other";
  roomNumber?: string;
  status: "pending" | "resolved" | "in-progress";
  priority?: "HIGH" | "MEDIUM" | "LOW";
  createdAt: string;
}

export const getComplaints = async () => {
  const { data } = await api.get("/complaints");
  return data;
};

export const createComplaint = async (complaint: Omit<Complaint, "_id" | "createdAt">) => {
  const { data } = await api.post("/complaints", complaint);
  return data;
};

export const updateComplaint = async (id: string, complaint: Partial<Complaint>) => {
  const { data } = await api.put(`/complaints/${id}`, complaint);
  return data;
};

export const getMyComplaints = async () => {
  const { data } = await api.get("/complaints/my-complaints");
  return data;
};
