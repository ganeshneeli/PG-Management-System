const jwt = require("jsonwebtoken");
const env = require("../config/env");
const fs = require("fs");

const log = (msg) => {
    const time = new Date().toISOString();
    fs.appendFileSync("debug.log", `[${time}] [Middleware] ${msg}\n`);
    console.log(`[Middleware] ${msg}`);
};

exports.authenticate = (req, res, next) => {
    let token = req.header("Authorization");
    
    // Check cookies if header is missing
    if (!token && req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (token) {
        token = token.replace("Bearer ", "");
    }

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No authentication token found" });
    }

    try {
        const verified = jwt.verify(token, env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
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
