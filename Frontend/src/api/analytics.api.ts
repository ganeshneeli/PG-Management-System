import api from "./axios";

export interface DashboardData {
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  totalTenants: number;
  monthlyRevenue: number;
  totalRevenue: number;
  collectedRevenue: number;
  pendingRevenue: number;
  pendingPayments: number;
  totalComplaints: number;
  pendingComplaints: number;
  totalVisitorRequests: number;
  pendingVisitorRequests: number;
  recentVisitors: any[];
  recentComplaints: any[];
  revenueChart: { month: string; revenue: number }[];
  occupancyChart: { name: string; value: number }[];
}

export const getDashboardData = async (): Promise<DashboardData> => {
  const { data } = await api.get("/analytics/dashboard");
  return data.data || data; // Extract inner data from { success, data } wrapper
};
