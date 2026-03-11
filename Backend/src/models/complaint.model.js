const mongoose = require("mongoose");
const STATUS = require("../constants/status");

const complaintSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant"
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ["maintenance", "food", "cleaning", "security", "other"],
        default: "other"
    },
    roomNumber: {
        type: String
    },
    priority: {
        type: String,
        enum: ["HIGH", "MEDIUM", "LOW"],
        default: "LOW"
    },
    status: {
        type: String,
        enum: Object.values(STATUS.COMPLAINT),
        default: STATUS.COMPLAINT.PENDING
    }
}, { timestamps: true });

// MongoDB Indexes for faster searching
complaintSchema.index({ tenantId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Complaint", complaintSchema);
