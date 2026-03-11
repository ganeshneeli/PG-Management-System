const visitorLogRepository = require("./visitorLog.repository");

class VisitorLogService {
    async logVisitor(data) {
        return await visitorLogRepository.create(data);
    }

    async getAllLogs() {
        return await visitorLogRepository.findAll();
    }

    async checkOutVisitor(id) {
        return await visitorLogRepository.checkOut(id);
    }

    async getActiveVisitors() {
        return await visitorLogRepository.findActive();
    }

    async updateStatus(id, status) {
        return await visitorLogRepository.updateStatus(id, status);
    }

    async getMyLogs(tenantId) {
        return await visitorLogRepository.findByTenantId(tenantId);
    }
}

module.exports = new VisitorLogService();
