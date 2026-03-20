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
            const isProduction = process.env.NODE_ENV === "production";
            res.cookie("token", result.token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
            const isProduction = process.env.NODE_ENV === "production";
            res.cookie("token", result.token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "none" : "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", "", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
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
