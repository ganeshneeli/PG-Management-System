const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    bedNumber: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    phone: {
        type: String,
        required: true
    },
    checkInDate: {
        type: Date,
        default: Date.now
    },
    checkOutDate: {
        type: Date
    },
    address: {
        type: String
    },
    idProof: {
        type: String
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    }
}, { timestamps: true });

// MongoDB Indexes for faster searching
tenantSchema.index({ name: 1 });
tenantSchema.index({ phone: 1 });
tenantSchema.index({ email: 1 });
tenantSchema.index({ roomId: 1 });
tenantSchema.index({ userId: 1 });

module.exports = mongoose.model("Tenant", tenantSchema);
