const roomRepository = require("./room.repository");

class RoomService {
    async getAllRooms(userRole = "admin") {
        const tenantRepository = require("../tenant/tenant.repository");
        const [rooms, tenants] = await Promise.all([
            roomRepository.findAll(),
            tenantRepository.findAll()
        ]);
        const activeTenants = tenants.filter(t => t.status === "active");

        return rooms.map(room => {
            const roomObj = room.toObject ? room.toObject() : room;
            // Embed active tenants belonging to this room
            const roomTenants = activeTenants.filter(t =>
                t.roomId && t.roomId._id
                    ? t.roomId._id.toString() === roomObj._id.toString()
                    : t.roomId && t.roomId.toString() === roomObj._id.toString()
            );

            // Explicitly map to plain objects with guaranteed fields
            roomObj.tenants = roomTenants.map(t => {
                const tenantData = {
                    _id: t._id.toString(),
                    name: t.name,
                    bedNumber: Number(t.bedNumber),
                    checkInDate: t.checkInDate,
                    status: t.status,
                };
                
                // DATA PRIVACY: Only admins see contact info
                if (userRole === "admin") {
                    tenantData.phone = t.phone;
                    tenantData.email = t.email || "";
                }
                
                return tenantData;
            });

            // Overwrite currentTenants count dynamically to guarantee accuracy
            roomObj.currentTenants = roomObj.tenants.length;

            // Auto update status based on capacity
            if (roomObj.currentTenants === 0) {
                roomObj.status = "vacant";
            } else if (roomObj.currentTenants >= roomObj.capacity) {
                roomObj.status = "occupied";
            } else {
                roomObj.status = "partial";
            }
            return roomObj;
        });
    }

    async getRoomById(id) {
        return await roomRepository.findById(id);
    }

    async createRoom(roomData) {
        return await roomRepository.create(roomData);
    }

    async updateRoom(id, roomData) {
        return await roomRepository.update(id, roomData);
    }

    async deleteRoom(id) {
        const Tenant = require("../../models/tenant.model");
        const activeTenants = await Tenant.countDocuments({ roomId: id, status: "active" });
        if (activeTenants > 0) {
            throw new Error(`Cannot delete room. There are ${activeTenants} active tenants assigned to this room.`);
        }
        return await roomRepository.delete(id);
    }
}

module.exports = new RoomService();
