const socketIo = require("socket.io");

let io;

exports.init = (server) => {
    const allowedOrigins = [
        process.env.FRONTEND_URL,
        "https://pgmanagmentsystem.netlify.app",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:5173"
    ].filter(Boolean);

    io = socketIo(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        connectTimeout: 45000,
        transports: ["websocket", "polling"]
    });

    io.on("connection", (socket) => {
        console.log("User connected to socket:", socket.id);

        socket.on("join", (userId) => {
            socket.join(userId.toString());
            console.log(`User ${userId} joined room`);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
};

// Internal helper to broadcast to other workers via IPC
const broadcastToIPC = (payload) => {
    if (process.send) {
        process.send({ type: "SOCKET_EVENT", payload });
    }
};

exports.sendNotification = (message, skipIPC = false) => {
    if (io) {
        io.emit("notification", message);
        if (!skipIPC) broadcastToIPC({ method: "sendNotification", args: [message] });
    }
};

exports.emitDashboardUpdate = (skipIPC = false) => {
    if (io) {
        io.emit("dashboard_update");
        if (!skipIPC) broadcastToIPC({ method: "emitDashboardUpdate", args: [] });
    }
};

exports.emitSyncEvent = (eventName, skipIPC = false) => {
    if (io) {
        io.emit(eventName);
        if (!skipIPC) broadcastToIPC({ method: "emitSyncEvent", args: [eventName] });
    }
};

exports.sendNotificationToUser = (userId, notification, skipIPC = false) => {
    if (io) {
        io.to(userId.toString()).emit("notification", notification);
        if (!skipIPC) broadcastToIPC({ method: "sendNotificationToUser", args: [userId, notification] });
    }
};

// Handle events coming from other workers via Master IPC
exports.handleIPCMessage = (msg) => {
    const { method, args } = msg.payload;
    // Use explicit method map because 'this' is undefined in CommonJS module scope
    const methodMap = {
        sendNotification: exports.sendNotification,
        emitDashboardUpdate: exports.emitDashboardUpdate,
        emitSyncEvent: exports.emitSyncEvent,
        sendNotificationToUser: exports.sendNotificationToUser,
    };
    const fn = methodMap[method];
    if (fn) {
        // Call the method with skipIPC=true to prevent infinite loops
        fn(...args, true);
    } else {
        console.warn(`[IPC] Unknown method: ${method}`);
    }
};
