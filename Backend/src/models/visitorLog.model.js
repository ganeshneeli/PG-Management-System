const mongoose = require("mongoose");

const visitorLogSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        required: true
    },
    visitorName: {
        type: String,
        required: true
    },
    relation: {
        type: String
    },
    phone: {
        type: String,
        required: true
    },
    checkInTime: {
        type: Date,
        default: Date.now
    },
    checkOutTime: {
        type: Date
    },
    purpose: {
        type: String
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "checked-out"],
        default: "pending"
    }
}, { timestamps: true });

// MongoDB Indexes for faster searching
visitorLogSchema.index({ tenantId: 1 });
visitorLogSchema.index({ status: 1 });
visitorLogSchema.index({ checkInTime: -1 });

module.exports = mongoose.model("VisitorLog", visitorLogSchema);
