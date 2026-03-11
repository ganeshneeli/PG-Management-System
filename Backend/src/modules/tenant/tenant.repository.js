const Tenant = require("../../models/tenant.model");

class TenantRepository {
    async findAll() {
        return await Tenant.find().populate("userId").populate("roomId");
    }

    async findById(id) {
        return await Tenant.findById(id).populate("userId").populate("roomId");
    }

    async create(tenantData) {
        return await Tenant.create(tenantData);
    }

    async update(id, tenantData) {
        return await Tenant.findByIdAndUpdate(id, tenantData, { new: true });
    }

    async delete(id) {
        return await Tenant.findByIdAndDelete(id);
    }

    async findByUserId(userId) {
        return await Tenant.findOne({ userId }).populate("roomId");
    }
}

module.exports = new TenantRepository();
