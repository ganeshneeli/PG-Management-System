import api from "./axios";

export interface VisitorLog {
    _id: string;
    tenantId: any;
    visitorName: string;
    relation: string;
    phone: string;
    checkInTime: string;
    checkOutTime?: string;
    purpose: string;
    status: "pending" | "approved" | "rejected" | "checked-out";
}

export const getVisitorLogs = async () => {
    const { data } = await api.get("/visitorLog");
    return data;
};

export const getMyVisitorLogs = async () => {
    const { data } = await api.get("/visitorLog/my-logs");
    return data;
};

export const logVisitor = async (logData: Partial<VisitorLog>) => {
    const { data } = await api.post("/visitorLog", logData);
    return data;
};

export const checkOutVisitor = async (id: string) => {
    const { data } = await api.patch(`/visitorLog/${id}/check-out`);
    return data;
};

export const updateVisitorStatus = async (id: string, status: string) => {
    const { data } = await api.patch(`/visitorLog/${id}/status`, { status });
    return data;
};
