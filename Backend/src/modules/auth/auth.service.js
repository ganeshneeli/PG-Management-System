const authRepository = require("./auth.repository");
const jwt = require("jsonwebtoken");
const env = require("../../config/env");

class AuthService {
    async register(userData) {
        const existingUser = await authRepository.findUserByEmail(userData.email);
        if (existingUser) {
            throw new Error("Email already exists");
        }
        // In a real app we'd hash password here
        const user = await authRepository.createUser(userData);
        return { user };
    }

    async login(identifier, password) {
        // Check if identifier is email or phone
        let user;
        if (identifier.includes("@")) {
            user = await authRepository.findUserByEmail(identifier);
        } else {
            user = await authRepository.findUserByPhone(identifier);
        }

        if (!user || user.password !== password) {
            throw new Error("Invalid credentials");
        }
        const token = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, { expiresIn: "1d" });
        return { token, user };
    }

    async getProfile(userId) {
        const user = await authRepository.findUserById(userId);
        if (!user) throw new Error("User not found");
        return user;
    }

    async updateProfile(userId, profileData) {
        return await authRepository.updateUser(userId, profileData);
    }
}

module.exports = new AuthService();
