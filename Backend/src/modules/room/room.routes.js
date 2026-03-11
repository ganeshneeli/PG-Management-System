const express = require("express");
const roomController = require("./room.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const ROLES = require("../../constants/roles");

const router = express.Router();

router.get("/", authenticate, roomController.getAllRooms);
router.post("/", authenticate, authorize([ROLES.ADMIN]), roomController.createRoom);
router.put("/:id", authenticate, authorize([ROLES.ADMIN]), roomController.updateRoom);
router.delete("/:id", authenticate, authorize([ROLES.ADMIN]), roomController.deleteRoom);

module.exports = router;
