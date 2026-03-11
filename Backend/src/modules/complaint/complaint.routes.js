const express = require("express");
const complaintController = require("./complaint.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");
const ROLES = require("../../constants/roles");

const router = express.Router();

router.get("/my-complaints", authenticate, authorize([ROLES.TENANT, ROLES.ADMIN]), complaintController.getMyComplaints);
router.get("/", authenticate, authorize([ROLES.ADMIN]), complaintController.getAllComplaints);
router.post("/", authenticate, authorize([ROLES.ADMIN, ROLES.TENANT]), complaintController.fileComplaint);
router.put("/:id", authenticate, authorize([ROLES.ADMIN]), complaintController.updateComplaint);

module.exports = router;
