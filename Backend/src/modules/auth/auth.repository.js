const User = require("../../models/user.model");

class AuthRepository {
    async findUserByEmail(email) {
        return await User.findOne({ email });
    }

    async findUserByPhone(phone) {
        return await User.findOne({ phone });
    }

    async createUser(userData) {
        return await User.create(userData);
    }

    async findUserById(id) {
        return await User.findById(id).select("-password");
    }

    async updateUser(id, updateData) {
        return await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    }

    async deleteUser(id) {
        return await User.findByIdAndDelete(id);
    }
}

module.exports = new AuthRepository();
