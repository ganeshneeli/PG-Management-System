const Room = require("../../models/room.model");

class RoomRepository {
    async findAll() {
        return await Room.find().sort({ roomNumber: 1 });
    }

    async findById(id) {
        return await Room.findById(id);
    }

    async create(roomData) {
        return await Room.create(roomData);
    }

    async update(id, roomData) {
        return await Room.findByIdAndUpdate(id, roomData, { new: true });
    }

    async delete(id) {
        return await Room.findByIdAndDelete(id);
    }
}

module.exports = new RoomRepository();
