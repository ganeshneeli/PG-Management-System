const notificationService = require("./notification.service");

class NotificationController {
    async sendNotification(req, res, next) {
        try {
            const { title, message, type } = req.body;
            if (!title || !message) {
                return res.status(400).json({ success: false, message: "Title and message are required" });
            }
            const result = await notificationService.sendNotificationToAll(title, message, type);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getNotifications(req, res, next) {
        try {
            const notifications = await notificationService.getUserNotifications(req.user.id);
            res.status(200).json({ success: true, data: notifications });
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req, res, next) {
        try {
            const notification = await notificationService.markAsRead(req.params.id);
            res.status(200).json({ success: true, data: notification });
        } catch (error) {
            next(error);
        }
    }

    async markAllAsRead(req, res, next) {
        try {
            await notificationService.markAllAsRead(req.user.id);
            res.status(200).json({ success: true, message: "All notifications marked as read" });
        } catch (error) {
            next(error);
        }
    }

    async broadcastAlert(req, res, next) {
        try {
            const { title, message, type } = req.body;
            const result = await notificationService.sendNotificationToAll(title, message, type);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NotificationController();
