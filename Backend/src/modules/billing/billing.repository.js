const Bill = require("../../models/bill.model");

/**
 * Retry wrapper for MongoDB operations.
 * Retries up to `maxRetries` times with exponential backoff on network errors.
 */
async function withRetry(operation, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (err) {
            const isNetworkError =
                err.name === "MongoNetworkError" ||
                err.message?.includes("EHOSTUNREACH") ||
                err.message?.includes("ECONNRESET") ||
                err.message?.includes("ETIMEDOUT") ||
                err.message?.includes("socket disconnected");

            if (isNetworkError && attempt < maxRetries) {
                const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
                console.warn(`[DB Retry] Attempt ${attempt}/${maxRetries} failed (${err.message}). Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw err; // Not a network error or max retries reached
            }
        }
    }
}

class BillingRepository {
    async findAll() {
        return await withRetry(() => Bill.find().populate("tenantId").populate("roomId").sort({ createdAt: -1 }).limit(100));
    }

    async findById(id) {
        return await withRetry(() => Bill.findById(id).populate("tenantId").populate("roomId"));
    }

    async create(billData) {
        return await withRetry(() => Bill.create(billData));
    }

    async update(id, billData) {
        return await withRetry(() => Bill.findByIdAndUpdate(id, billData, { new: true }).populate("tenantId").populate("roomId"));
    }

    async findByTenantId(tenantId) {
        return await withRetry(() => Bill.find({ tenantId }).populate("roomId").sort({ createdAt: -1 }).limit(100));
    }

    async findByRoomId(roomId, month) {
        const query = { roomId };
        if (month) query.month = month;
        return await withRetry(() => Bill.find(query).populate("tenantId").populate("roomId"));
    }

    async exists(tenantId, month, year) {
        return await withRetry(() => Bill.exists({ tenantId, month, year }));
    }

    async deleteByTenantId(tenantId) {
        return await withRetry(() => Bill.deleteMany({ tenantId }));
    }
}

module.exports = new BillingRepository();
