const Complaint = require("../../models/complaint.model");

class ComplaintRepository {
    async findAll(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            Complaint.find().populate("tenantId").sort({ createdAt: -1 }).skip(skip).limit(limit),
            Complaint.countDocuments()
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }

    async findById(id) {
        return await Complaint.findById(id).populate("tenantId");
    }

    async create(complaintData) {
        return await Complaint.create(complaintData);
    }

    async update(id, updateData) {
        return await Complaint.findByIdAndUpdate(id, updateData, { new: true }).populate("tenantId");
    }

    async findByTenantId(tenantId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            Complaint.find({ tenantId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Complaint.countDocuments({ tenantId })
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }
}

module.exports = new ComplaintRepository();
