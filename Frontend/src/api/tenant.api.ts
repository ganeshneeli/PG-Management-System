import api from "./axios";

export interface Tenant {
  _id: string;
  name: string;
  email: string;
  phone: string;
  roomId: any; // Can be ID or populated object
  bedNumber: number;
  roomNumber?: string;
  checkInDate: string;
  checkOutDate?: string;
  status: "active" | "inactive";
  address?: string;
  idProof?: string;
}

export const getTenants = async () => {
  const { data } = await api.get("/tenants");
  return data;
};

export const checkOutTenant = async (id: string) => {
  const { data } = await api.patch(`/tenants/${id}/check-out`);
  return data;
};

export const getMyDetails = async () => {
  const { data } = await api.get("/tenants/me");
  return data;
};

export const createTenant = async (tenant: Omit<Tenant, "_id">) => {
  const { data } = await api.post("/tenants", tenant);
  return data;
};

export const updateTenant = async (id: string, tenant: Partial<Tenant>) => {
  const { data } = await api.put(`/tenants/${id}`, tenant);
  return data;
};

export const deleteTenant = async (id: string) => {
  const { data } = await api.delete(`/tenants/${id}`);
  return data;
};
