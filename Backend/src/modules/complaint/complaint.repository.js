const Complaint = require("../../models/complaint.model");

class ComplaintRepository {
    async findAll() {
        return await Complaint.find().populate("tenantId").sort({ createdAt: -1 }).limit(100);
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

    async findByTenantId(tenantId) {
        return await Complaint.find({ tenantId }).sort({ createdAt: -1 }).limit(100);
    }
}

module.exports = new ComplaintRepository();
