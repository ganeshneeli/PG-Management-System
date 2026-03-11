const complaintRepository = require("./complaint.repository");

class ComplaintService {
    async getAllComplaints() {
        return await complaintRepository.findAll();
    }

    async getComplaintById(id) {
        return await complaintRepository.findById(id);
    }

    async fileComplaint(complaintData) {
        // Sanitize tenantId: If it's not a valid MongoDB ObjectId hex string, or if it's a common placeholder like '66', remove it.
        if (complaintData.tenantId && (!/^[0-9a-fA-F]{24}$/.test(complaintData.tenantId) || complaintData.tenantId === "66")) {
            delete complaintData.tenantId;
        }
        return await complaintRepository.create(complaintData);
    }

    async updateComplaint(id, updateData) {
        return await complaintRepository.update(id, updateData);
    }
}

module.exports = new ComplaintService();
