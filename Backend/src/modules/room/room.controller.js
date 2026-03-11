const roomService = require("./room.service");
const redis = require("../../config/redis");

class RoomController {
    async getAllRooms(req, res, next) {
        try {
            const rooms = await roomService.getAllRooms();
            res.status(200).json({ success: true, count: rooms.length, data: rooms });
        } catch (error) {
            next(error);
        }
    }

    async createRoom(req, res, next) {
        try {
            const room = await roomService.createRoom(req.body);
            const socketServer = require("../../sockets/socket.server");
            socketServer.emitSyncEvent("sync_rooms");
            await redis.del("dashboard_stats");
            res.status(201).json({ success: true, data: room });
        } catch (error) {
            next(error);
        }
    }

    async updateRoom(req, res, next) {
        try {
            const room = await roomService.updateRoom(req.params.id, req.body);
            const socketServer = require("../../sockets/socket.server");
            socketServer.emitSyncEvent("sync_rooms");
            await redis.del("dashboard_stats");
            res.status(200).json({ success: true, data: room });
        } catch (error) {
            next(error);
        }
    }

    async deleteRoom(req, res, next) {
        try {
            await roomService.deleteRoom(req.params.id);
            const socketServer = require("../../sockets/socket.server");
            socketServer.emitSyncEvent("sync_rooms");
            await redis.del("dashboard_stats");
            res.status(200).json({ success: true, message: "Room deleted" });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RoomController();
