const mongoose = require("mongoose");
const STATUS = require("../constants/status");

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true
    },
    roomType: {
        type: String,
        enum: ["single", "double", "triple", "four-sharing", "dormitory"],
        default: "double"
    },
    status: {
        type: String,
        enum: Object.values(STATUS.ROOM),
        default: STATUS.ROOM.VACANT
    },
    capacity: {
        type: Number,
        default: 1
    },
    currentTenants: {
        type: Number,
        default: 0
    },
    rentPerBed: {
        type: Number,
        default: 0
    },
    rentAmount: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// MongoDB Indexes for faster searching
roomSchema.index({ status: 1 });
roomSchema.index({ rentAmount: 1 });
roomSchema.index({ roomType: 1, status: 1 }); // Compound index for dashboard filtering

module.exports = mongoose.model("Room", roomSchema);
