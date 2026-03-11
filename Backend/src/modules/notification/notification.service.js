const socketServer = require("../../sockets/socket.server");
const notificationRepository = require("./notification.repository");

class NotificationService {
    async sendNotificationToAll(title, message, type = "alert") {
        const User = require("../../models/user.model");
        const users = await User.find();

        const notifications = users.map(user => ({
            userId: user._id,
            title,
            message,
            type
        }));

        await notificationRepository.createMany(notifications);

        // Emit via socket
        socketServer.sendNotification({ title, message, type });
        return { success: true, message: "Broadcast notification sent." };
    }

    async createNotification({ userId, title, message, type }) {
        const notification = await notificationRepository.create({ userId, title, message, type });
        socketServer.sendNotificationToUser(userId.toString(), { title, message, type });
        return notification;
    }

    async getUserNotifications(userId) {
        return await notificationRepository.findAll(userId);
    }

    async markAsRead(id) {
        return await notificationRepository.markAsRead(id);
    }

    async markAllAsRead(userId) {
        return await notificationRepository.markAllAsRead(userId);
    }
}

module.exports = new NotificationService();
