const express = require("express");
const analyticsController = require("./analytics.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const ROLES = require("../../constants/roles");

const router = express.Router();

router.get("/dashboard", authenticate, authorize([ROLES.ADMIN]), analyticsController.getDashboardStats);

module.exports = router;
