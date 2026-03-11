const express = require("express");
const notificationController = require("./notification.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const ROLES = require("../../constants/roles");

const router = express.Router();

// Get personal/broadcast notifications
router.get("/", authenticate, notificationController.getNotifications);

// Mark as read
router.put("/read-all", authenticate, notificationController.markAllAsRead);
router.put("/:id/read", authenticate, notificationController.markAsRead);

// Admin broadcast (existing)
router.post("/", authenticate, authorize([ROLES.ADMIN]), notificationController.sendNotification);
router.post("/broadcast-alert", authenticate, authorize([ROLES.ADMIN]), notificationController.broadcastAlert);

module.exports = router;
