const visitorLogService = require("./visitorLog.service");
const redis = require("../../config/redis");

class VisitorLogController {
    async logVisitor(req, res, next) {
        try {
            const log = await visitorLogService.logVisitor(req.body);
            require("../../sockets/socket.server").emitSyncEvent("sync_visitors");
            await redis.del("dashboard_stats");
            res.status(201).json({ success: true, data: log });
        } catch (error) {
            next(error);
        }
    }

    async getAllLogs(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const result = await visitorLogService.getAllLogs(page, limit);
            res.status(200).json({ 
                success: true, 
                count: result.data.length,
                total: result.total,
                page: result.page,
                totalPages: result.totalPages,
                data: result.data 
            });
        } catch (error) {
            next(error);
        }
    }
 
    async checkOutVisitor(req, res, next) {
        try {
            const log = await visitorLogService.checkOutVisitor(req.params.id);
            require("../../sockets/socket.server").emitSyncEvent("sync_visitors");
            await redis.del("dashboard_stats");
            res.status(200).json({ success: true, data: log });
        } catch (error) {
            next(error);
        }
    }
 
    async getMyLogs(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const tenant = await require("../tenant/tenant.repository").findByUserId(req.user.id);
            if (!tenant) return res.status(404).json({ success: false, message: "Tenant profile not found" });
            const result = await visitorLogService.getMyLogs(tenant._id, page, limit);
            res.status(200).json({ 
                success: true, 
                count: result.data.length,
                total: result.total,
                page: result.page,
                totalPages: result.totalPages,
                data: result.data 
            });
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { status } = req.body;
            const log = await visitorLogService.updateStatus(req.params.id, status);

            // Notify tenant
            const notificationService = require("../notification/notification.service");
            await notificationService.createNotification({
                userId: log.tenantId, // This might need to be the actual User ID if stored differently
                title: "Visitor Request Update",
                message: `Your request for visitor ${log.visitorName} has been ${status}.`,
                type: status === "approved" ? "success" : "warning"
            });

            require("../../sockets/socket.server").emitSyncEvent("sync_visitors");

            await redis.del("dashboard_stats");
            res.status(200).json({ success: true, data: log });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new VisitorLogController();
