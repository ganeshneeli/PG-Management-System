import api from "./axios";

export interface MenuItem {
  _id: string;
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export const getMenu = async () => {
  const { data } = await api.get("/menu");
  return data;
};

export const createMenuItem = async (item: Omit<MenuItem, "_id">) => {
  const { data } = await api.post("/menu", item);
  return data;
};

export const updateMenuItem = async (id: string, item: Partial<MenuItem>) => {
  const { data } = await api.put(`/menu/${id}`, item);
  return data;
};
