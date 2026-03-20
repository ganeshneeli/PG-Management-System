const authRepository = require("./auth.repository");
const User = require("../../models/user.model");
const jwt = require("jsonwebtoken");
const env = require("../../config/env");
const ErrorResponse = require("../../utils/errorResponse");

class AuthService {
    async register(userData) {
        const existingUser = await authRepository.findUserByEmail(userData.email);
        if (existingUser) {
            throw new ErrorResponse("Email already exists", 400);
        }
        
        // Default password to phone for tenants if not provided
        if (userData.role === "tenant" && !userData.password) {
            userData.password = userData.phone;
        }

        const user = await authRepository.createUser(userData);
        return { user };
    }

    async login(identifier, password) {
        // Check if identifier is email or phone
        let user;
        if (identifier.includes("@")) {
            user = await User.findOne({ email: identifier.toLowerCase() });
        } else {
            user = await User.findOne({ phone: identifier });
        }

        if (!user || !(await user.matchPassword(password))) {
            throw new ErrorResponse("Invalid credentials", 401);
        }
        const token = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, { expiresIn: "1d" });
        return { token, user };
    }

    async getProfile(userId) {
        const user = await authRepository.findUserById(userId);
        if (!user) throw new ErrorResponse("User not found", 404);
        return user;
    }

    async updateProfile(userId, profileData) {
        return await authRepository.updateUser(userId, profileData);
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findById(userId);
        if (!user) {
            throw new ErrorResponse("User not found", 404);
        }

        if (!(await user.matchPassword(currentPassword))) {
            throw new ErrorResponse("Invalid current password", 401);
        }

        user.password = newPassword;
        await user.save(); // This will trigger the pre-save hashing hook
        return { success: true };
    }
}

module.exports = new AuthService();
