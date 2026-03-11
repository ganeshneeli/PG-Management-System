const VisitorLog = require("../../models/visitorLog.model");

class VisitorLogRepository {
    async create(data) {
        return await VisitorLog.create(data);
    }

    async findAll() {
        return await VisitorLog.find().populate("tenantId").sort({ checkInTime: -1 }).limit(100);
    }

    async checkOut(id) {
        return await VisitorLog.findByIdAndUpdate(id, { checkOutTime: new Date(), status: "checked-out" }, { new: true });
    }

    async findActive() {
        return await VisitorLog.find({ status: { $in: ["pending", "approved"] } }).populate("tenantId");
    }

    async updateStatus(id, status) {
        return await VisitorLog.findByIdAndUpdate(id, { status }, { new: true });
    }

    async findByTenantId(tenantId) {
        return await VisitorLog.find({ tenantId }).sort({ checkInTime: -1 }).limit(100);
    }
}

module.exports = new VisitorLogRepository();
