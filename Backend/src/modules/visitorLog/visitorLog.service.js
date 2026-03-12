const visitorLogRepository = require("./visitorLog.repository");

class VisitorLogService {
    async logVisitor(data) {
        return await visitorLogRepository.create(data);
    }

    async getAllLogs(page, limit) {
        return await visitorLogRepository.findAll(page, limit);
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
 
    async getMyLogs(tenantId, page, limit) {
        return await visitorLogRepository.findByTenantId(tenantId, page, limit);
    }
}

module.exports = new VisitorLogService();
