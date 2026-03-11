const mongoose = require("mongoose");
const STATUS = require("../constants/status");

const billSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    electricity: {
        type: Number,
        default: 0
    },
    extraCharges: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: Object.values(STATUS.BILL),
        default: STATUS.BILL.PENDING
    },
    dueDate: {
        type: Date
    },
    paidDate: {
        type: Date
    }
}, { timestamps: true });

// ── Indexes for high-performance searching ──────────────────────────────────
billSchema.index({ tenantId: 1, month: 1, year: 1 }, { unique: true });
billSchema.index({ roomId: 1 });
billSchema.index({ status: 1 });
billSchema.index({ dueDate: 1 });
billSchema.index({ createdAt: -1 }); // Optimized for "Recent Payments"

module.exports = mongoose.model("Bill", billSchema);
