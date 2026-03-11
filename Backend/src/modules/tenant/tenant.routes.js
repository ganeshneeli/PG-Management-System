const express = require("express");
const tenantController = require("./tenant.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const ROLES = require("../../constants/roles");

const router = express.Router();

router.get("/me", authenticate, authorize([ROLES.TENANT, ROLES.ADMIN]), tenantController.getMyDetails);
router.get("/", authenticate, authorize([ROLES.ADMIN]), tenantController.getAllTenants);
router.post("/", authenticate, authorize([ROLES.ADMIN]), tenantController.createTenant);
router.patch("/:id/check-out", authenticate, authorize([ROLES.ADMIN]), tenantController.checkOut);
router.put("/:id", authenticate, authorize([ROLES.ADMIN]), tenantController.updateTenant);
router.delete("/:id", authenticate, authorize([ROLES.ADMIN]), tenantController.deleteTenant);

module.exports = router;
