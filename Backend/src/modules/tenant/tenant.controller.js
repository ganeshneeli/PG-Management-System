const tenantService = require("./tenant.service");
const redis = require("../../config/redis");

class TenantController {
    async getAllTenants(req, res, next) {
        try {
            const tenants = await tenantService.getAllTenants();
            res.status(200).json({ success: true, count: tenants.length, data: tenants });
        } catch (error) {
            next(error);
        }
    }

    async createTenant(req, res, next) {
        try {
            const tenant = await tenantService.createTenant(req.body);
            const socketServer = require("../../sockets/socket.server");
            socketServer.emitSyncEvent("sync_tenants");
            socketServer.emitSyncEvent("sync_rooms"); // NEW: Adding tenant changes room occupancy
            await redis.del("dashboard_stats");
            res.status(201).json({ success: true, data: tenant });
        } catch (error) {
            next(error);
        }
    }

    async updateTenant(req, res, next) {
        try {
            const tenant = await tenantService.updateTenant(req.params.id, req.body);
            require("../../sockets/socket.server").emitSyncEvent("sync_tenants");
            await redis.del("dashboard_stats");
            res.status(200).json({ success: true, data: tenant });
        } catch (error) {
            next(error);
        }
    }

    async deleteTenant(req, res, next) {
        try {
            await tenantService.deleteTenant(req.params.id);
            const socketServer = require("../../sockets/socket.server");
            socketServer.emitSyncEvent("sync_tenants");
            socketServer.emitSyncEvent("sync_rooms"); // NEW: Deleting tenant changes room occupancy
            await redis.del("dashboard_stats");
            res.status(200).json({ success: true, message: "Tenant deleted" });
        } catch (error) {
            next(error);
        }
    }

    async checkOut(req, res, next) {
        try {
            await tenantService.checkOut(req.params.id);
            const socketServer = require("../../sockets/socket.server");
            socketServer.emitSyncEvent("sync_tenants");
            socketServer.emitSyncEvent("sync_rooms"); // NEW: Checkout changes room occupancy
            await redis.del("dashboard_stats");
            res.status(200).json({ success: true, message: "Tenant checked out successfully" });
        } catch (error) {
            next(error);
        }
    }

    async getMyDetails(req, res, next) {
        try {
            const tenant = await require("./tenant.repository").findByUserId(req.user.id);
            if (!tenant) return res.status(404).json({ success: false, message: "Tenant record not found" });
            res.status(200).json({ success: true, data: tenant });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TenantController();
