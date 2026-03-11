const roomRepository = require("./room.repository");

class RoomService {
    async getAllRooms() {
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
            roomObj.tenants = roomTenants.map(t => ({
                _id: t._id.toString(),
                name: t.name,
                phone: t.phone,
                email: t.email || "",
                bedNumber: Number(t.bedNumber),   // ← Force Number type
                checkInDate: t.checkInDate,
                status: t.status,
            }));

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
        return await roomRepository.delete(id);
    }
}

module.exports = new RoomService();
