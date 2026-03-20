const authService = require("./auth.service");
const { validationResult } = require('express-validator');

class AuthController {
    async register(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const result = await authService.register(req.body);
            
            // Set HttpOnly Cookie
            res.cookie("token", result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { email, phone, password } = req.body;
            const identifier = email || phone;
            const result = await authService.login(identifier, password);

            // Set HttpOnly Cookie
            res.cookie("token", result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0)
        });
        res.status(200).json({ success: true, message: "Logged out successfully" });
    }

    async getProfile(req, res, next) {
        try {
            const user = await authService.getProfile(req.user.id);
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            const user = await authService.updateProfile(req.user.id, req.body);
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            await authService.changePassword(req.user.id, currentPassword, newPassword);
            res.status(200).json({ success: true, message: "Password changed successfully" });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
