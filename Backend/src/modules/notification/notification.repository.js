const Notification = require("../../models/notification.model");

class NotificationRepository {
    async create(data) {
        return await Notification.create(data);
    }

    async createMany(dataArray) {
        return await Notification.insertMany(dataArray);
    }

    async findAll(userId) {
        // Find personal notifications or broadcasts (where userId is null)
        return await Notification.find({
            $or: [{ userId: userId }, { userId: { $exists: false } }, { userId: null }]
        }).sort({ createdAt: -1 }).limit(100);
    }

    async markAsRead(id) {
        return await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    }

    async markAllAsRead(userId) {
        return await Notification.updateMany(
            { $or: [{ userId: userId }, { userId: null }], isRead: false },
            { isRead: true }
        );
    }
}

module.exports = new NotificationRepository();
