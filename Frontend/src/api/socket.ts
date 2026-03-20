import { io } from "socket.io-client";

const getSocketURL = () => {
    const envUrl = import.meta.env.VITE_SOCKET_URL;
    if (envUrl) return envUrl;

    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
        // Fallback: Use API origin (e.g., https://api.example.com/api/v1 -> https://api.example.com)
        return apiUrl.replace(/\/api\/v1\/?$/, "");
    }

    return import.meta.env.MODE === 'development' ? "http://localhost:5001" : "https://pg-management-system-b6ak.onrender.com";
};

export const SOCKET_URL = getSocketURL();

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 30000,
    transports: ["websocket"] // Essential for Render to avoid polling upgrades failing
});

export const connectSocket = (userId: string) => {
    if (!socket.connected) {
        const token = localStorage.getItem("token");
        socket.auth = { token };
        socket.connect();
        socket.emit("join", userId);
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
