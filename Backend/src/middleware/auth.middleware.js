const jwt = require("jsonwebtoken");
const env = require("../config/env");
const fs = require("fs");

const log = (msg) => {
    const time = new Date().toISOString();
    fs.appendFileSync("debug.log", `[${time}] [Middleware] ${msg}\n`);
    console.log(`[Middleware] ${msg}`);
};

exports.authenticate = (req, res, next) => {
    const token = req.header("Authorization");
    log(`Auth attempt: ${req.method} ${req.originalUrl || req.url}`);

    if (!token) {
        log("Auth FAILED: No token provided");
        return res.status(401).json({ message: "Access Denied" });
    }

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), env.JWT_SECRET);
        req.user = verified;
        log(`Auth SUCCESS: User ID ${verified.id}, Role ${verified.role}`);
        next();
    } catch (err) {
        log(`Auth FAILED: Invalid token - ${err.message}`);
        res.status(401).json({ message: "Invalid Token" });
    }
};

exports.authorize = (roles = []) => {
    return (req, res, next) => {
        log(`Authorize attempt: Required roles [${roles}], User role ${req.user?.role}`);
        if (!roles.includes(req.user.role)) {
            log(`Authorize FAILED: Role ${req.user.role} not in [${roles}]`);
            return res.status(403).json({ message: "Forbidden Access" });
        }
        log("Authorize SUCCESS");
        next();
    };
};
