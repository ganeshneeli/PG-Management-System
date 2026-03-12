const VisitorLog = require("../../models/visitorLog.model");

class VisitorLogRepository {
    async create(data) {
        return await VisitorLog.create(data);
    }

    async findAll(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            VisitorLog.find().populate("tenantId").sort({ checkInTime: -1 }).skip(skip).limit(limit),
            VisitorLog.countDocuments()
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
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

    async findByTenantId(tenantId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            VisitorLog.find({ tenantId }).sort({ checkInTime: -1 }).skip(skip).limit(limit),
            VisitorLog.countDocuments({ tenantId })
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }
}

module.exports = new VisitorLogRepository();
