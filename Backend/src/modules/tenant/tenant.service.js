const tenantRepository = require("./tenant.repository");
const roomService = require("../room/room.service");
const STATUS = require("../../constants/status");

class TenantService {
    async getAllTenants() {
        return await tenantRepository.findAll();
    }

    async getTenantById(id) {
        return await tenantRepository.findById(id);
    }

    async createTenant(tenantData) {
        const authRepository = require("../auth/auth.repository");
        const ROLES = require("../../constants/roles");

        // 1. Ensure a User account exists - Parallel check
        let user = null;
        try {
            const [byPhone, byEmail] = await Promise.all([
                tenantData.phone ? authRepository.findUserByPhone(tenantData.phone) : null,
                tenantData.email ? authRepository.findUserByEmail(tenantData.email) : null
            ]);
            user = byPhone || byEmail;

            if (!user) {
                user = await authRepository.createUser({
                    name: tenantData.name,
                    email: tenantData.email || `${tenantData.phone}@pg.local`,
                    phone: tenantData.phone,
                    password: tenantData.phone,
                    role: ROLES.TENANT
                });
            }
            tenantData.userId = user._id;
        } catch (err) {
            console.error("Auto-user creation warning:", err.message);
        }

        // 2. Atomic Room capacity check and occupancy update
        const RoomModel = require("../../models/room.model");
        const room = await RoomModel.findOneAndUpdate(
            { 
                _id: tenantData.roomId, 
                $expr: { $lt: ["$currentTenants", "$capacity"] } 
            },
            { $inc: { currentTenants: 1 } },
            { new: true }
        );

        if (!room) {
            // Re-check if room exists at all to provide better error
            const exists = await RoomModel.findById(tenantData.roomId);
            if (!exists) throw new Error("Room not found.");
            throw new Error("Room is already full. Cannot add more tenants.");
        }

        // 3. Set status and auto-update room status if full
        tenantData.status = "active";
        const tenant = await tenantRepository.create(tenantData);

        if (room.currentTenants >= room.capacity) {
            await RoomModel.findByIdAndUpdate(room._id, { status: STATUS.ROOM.OCCUPIED });
        } else {
            await RoomModel.findByIdAndUpdate(room._id, { status: "partial" });
        }

        return tenant;
    }

    async updateTenant(id, tenantData) {
        return await tenantRepository.update(id, tenantData);
    }

    async deleteTenant(id) {
        const tenant = await tenantRepository.findById(id);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        // 1. Delete associated User account if it exists
        if (tenant.userId) {
            try {
                const authRepository = require("../auth/auth.repository");
                const userId = tenant.userId._id || tenant.userId;
                await authRepository.deleteUser(userId);
                console.log(`[DeleteTenant] Associated User ${userId} deleted.`);
            } catch (err) {
                console.error("[DeleteTenant] Warning: Could not delete associated user:", err.message);
            }
        }

        // 2. Atomic Room occupancy decrement
        const roomId = tenant.roomId?._id || tenant.roomId;
        if (roomId) {
            const RoomModel = require("../../models/room.model");
            const room = await RoomModel.findByIdAndUpdate(
                roomId, 
                { $inc: { currentTenants: -1 } }, 
                { new: true }
            );

            if (room) {
                // Ensure count doesn't drop below zero and update status
                const finalCount = Math.max(0, room.currentTenants);
                let newStatus = "partial";
                if (finalCount === 0) newStatus = STATUS.ROOM.VACANT;
                else if (finalCount >= room.capacity) newStatus = STATUS.ROOM.OCCUPIED;

                await RoomModel.findByIdAndUpdate(roomId, { 
                    currentTenants: finalCount,
                    status: newStatus 
                });
            }
        }

        // 3. Delete associated Bills (prevents "Unknown" orphaned entries in billing)
        try {
            const billingRepository = require("../billing/billing.repository");
            const deleted = await billingRepository.deleteByTenantId(id);
            console.log(`[DeleteTenant] Deleted ${deleted.deletedCount} bills for tenant ${id}.`);
        } catch (err) {
            console.error("[DeleteTenant] Warning: Could not delete associated bills:", err.message);
        }

        // 4. Delete tenant record
        return await tenantRepository.delete(id);
    }

    async checkOut(id) {
        const tenant = await tenantRepository.findById(id);
        if (!tenant) throw new Error("Tenant not found");

        const roomId = tenant.roomId?._id || tenant.roomId;
        const [room, updatedTenant] = await Promise.all([
            roomService.getRoomById(roomId),
            tenantRepository.update(id, {
                checkOutDate: new Date(),
                status: "inactive"
            })
        ]);

        if (roomId) {
            const RoomModel = require("../../models/room.model");
            const room = await RoomModel.findByIdAndUpdate(
                roomId, 
                { $inc: { currentTenants: -1 } }, 
                { new: true }
            );

            if (room) {
                const finalCount = Math.max(0, room.currentTenants);
                let newStatus = "partial";
                if (finalCount === 0) newStatus = STATUS.ROOM.VACANT;
                else if (finalCount >= room.capacity) newStatus = STATUS.ROOM.OCCUPIED;

                await RoomModel.findByIdAndUpdate(roomId, { 
                    currentTenants: finalCount,
                    status: newStatus 
                });
            }
        }

        return updatedTenant;
    }
}

module.exports = new TenantService();
