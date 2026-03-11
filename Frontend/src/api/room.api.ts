import api from "./axios";

export interface Room {
  _id: string;
  roomNumber: string;
  roomType: "single" | "double" | "triple" | "four-sharing" | "dormitory";
  capacity: number;
  currentTenants?: number;
  rentPerBed?: number;
  rentAmount: number;
  status: "vacant" | "occupied";
  amenities?: string[];
  floor?: number;
  tenants?: {
    _id: string;
    name: string;
    phone: string;
    bedNumber: number;
    checkInDate: string;
  }[];
}

export const getRooms = async () => {
  const { data } = await api.get("/rooms");
  return data;
};

export const createRoom = async (room: Omit<Room, "_id">) => {
  const { data } = await api.post("/rooms", room);
  return data;
};

export const updateRoom = async (id: string, room: Partial<Room>) => {
  const { data } = await api.put(`/rooms/${id}`, room);
  return data;
};

export const deleteRoom = async (id: string) => {
  const { data } = await api.delete(`/rooms/${id}`);
  return data;
};
