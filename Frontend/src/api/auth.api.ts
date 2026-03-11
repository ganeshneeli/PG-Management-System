import api from "./axios";

export const loginUser = async (credentials: { email?: string; phone?: string; password: string }) => {
  const { data } = await api.post("/auth/login", credentials);
  return data.data || data; // Extract { token, user } from { success, data: { token, user } }
};

export const registerUser = async (userData: { name: string; email: string; password: string }) => {
  const { data } = await api.post("/auth/register", userData);
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get("/auth/profile");
  return data;
};

export const updateProfile = async (profileData: Record<string, unknown>) => {
  const { data } = await api.put("/auth/profile", profileData);
  return data;
};
