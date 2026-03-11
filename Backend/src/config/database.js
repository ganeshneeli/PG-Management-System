const mongoose = require("mongoose");
const env = require("./env");

let retryCount = 0;
const MAX_RETRY_DELAY_MS = 60000; // Cap at 60 seconds

const connectWithRetry = async (delayMs = 5000) => {
    try {
        await mongoose.connect(env.MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            maxPoolSize: 50,
            minPoolSize: 2,
            retryWrites: true,
            retryReads: true,
        });
        retryCount = 0; // Reset on success
        console.log("MongoDB Connected...");
    } catch (err) {
        retryCount++;
        const nextDelay = Math.min(delayMs * 2, MAX_RETRY_DELAY_MS);
        console.error(`[MongoDB] Connection failed (Attempt ${retryCount}): ${err.message}`);
        console.warn(`[MongoDB] Retrying in ${nextDelay / 1000}s...`);
        setTimeout(() => connectWithRetry(nextDelay), nextDelay);
    }
};

const connectDB = async () => {
    await connectWithRetry();

    mongoose.connection.on("disconnected", () => {
        console.warn("[MongoDB] Disconnected. Attempting reconnect with backoff...");
        connectWithRetry(); // Will use exponential backoff
    });

    mongoose.connection.on("error", (err) => {
        console.error("[MongoDB] Connection error:", err.message);
        // Handle DNS errors specifically
        if (err.message?.includes("ENOTFOUND") || err.message?.includes("EHOSTUNREACH")) {
            console.warn("[MongoDB] DNS/Network error detected. Will retry on next disconnect event.");
        }
    });

    mongoose.connection.on("reconnected", () => {
        retryCount = 0;
        console.log("[MongoDB] Reconnected successfully.");
    });
};

module.exports = connectDB;
