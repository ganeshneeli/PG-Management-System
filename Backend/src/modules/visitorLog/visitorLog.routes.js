const express = require("express");
const visitorLogController = require("./visitorLog.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const ROLES = require("../../constants/roles");

const router = express.Router();

router.get("/", authenticate, authorize([ROLES.ADMIN]), visitorLogController.getAllLogs);
router.get("/my-logs", authenticate, authorize([ROLES.TENANT]), visitorLogController.getMyLogs);
router.post("/", authenticate, authorize([ROLES.ADMIN, ROLES.TENANT]), visitorLogController.logVisitor);
router.patch("/:id/status", authenticate, authorize([ROLES.ADMIN]), visitorLogController.updateStatus);
router.patch("/:id/check-out", authenticate, authorize([ROLES.ADMIN]), visitorLogController.checkOutVisitor);

module.exports = router;
