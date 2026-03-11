const express = require("express");
const billingController = require("./billing.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const ROLES = require("../../constants/roles");

const router = express.Router();

router.get("/my-bills", authenticate, authorize([ROLES.TENANT, ROLES.ADMIN]), billingController.getMyBills);
router.get("/:id/download", authenticate, authorize([ROLES.ADMIN, ROLES.TENANT]), billingController.downloadBill);
router.get("/", authenticate, authorize([ROLES.ADMIN, ROLES.TENANT]), billingController.getAllBills);
router.post("/generate-monthly", authenticate, authorize([ROLES.ADMIN]), billingController.generateMonthlyBills);
router.post("/", authenticate, authorize([ROLES.ADMIN]), billingController.generateBill);
router.put("/payment-update/:id", authenticate, authorize([ROLES.ADMIN]), billingController.updatePayment);
router.post("/:id/resend-reminder", authenticate, authorize([ROLES.ADMIN]), billingController.resendBillReminder);
router.post("/room-remind", authenticate, authorize([ROLES.ADMIN]), billingController.remindRoomUnpaid);
router.post("/remind-all", authenticate, authorize([ROLES.ADMIN]), billingController.remindAllUnpaid);
router.post("/cleanup-duplicates", authenticate, authorize([ROLES.ADMIN]), billingController.cleanupDuplicates);
router.post("/cleanup-orphaned", authenticate, authorize([ROLES.ADMIN]), billingController.cleanupOrphanedBills);

module.exports = router;
