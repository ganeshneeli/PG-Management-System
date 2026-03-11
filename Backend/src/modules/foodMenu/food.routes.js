const express = require("express");
const foodController = require("./food.controller");
const foodMenuController = require("./food.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const ROLES = require("../../constants/roles");

const router = express.Router();

// Tenants can view the menu, Admins can update it
router.get("/today", foodMenuController.getTodayMenu);
router.get("/", authenticate, authorize([ROLES.ADMIN, ROLES.TENANT]), foodMenuController.getMenu);
router.post("/generate-qr", authenticate, authorize([ROLES.ADMIN]), foodMenuController.generateQR);
router.post("/", authenticate, authorize([ROLES.ADMIN]), foodMenuController.addMenu);
router.put("/:id", authenticate, authorize([ROLES.ADMIN]), foodMenuController.updateMenu);

module.exports = router;
