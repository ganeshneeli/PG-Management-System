const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const { errorHandler } = require("./middleware/error.middleware");
const { logger } = require("./middleware/logger.middleware");

// Importing Routes
const authRoutes = require("./modules/auth/auth.routes");
const roomRoutes = require("./modules/room/room.routes");
const tenantRoutes = require("./modules/tenant/tenant.routes");
const billingRoutes = require("./modules/billing/billing.routes");
const foodRoutes = require("./modules/foodMenu/food.routes");
const notificationRoutes = require("./modules/notification/notification.routes");
const complaintRoutes = require("./modules/complaint/complaint.routes");
const analyticsRoutes = require("./modules/analytics/analytics.routes");
const visitorLogRoutes = require("./modules/visitorLog/visitorLog.routes");
const expenseRoutes = require("./modules/expense/expense.routes");

const app = express();
 
// Trust Proxy for Load Balancers (NGINX)
app.set('trust proxy', 1);
 
// Security Hardening
app.use(helmet()); // Add standard security headers
app.use(mongoSanitize()); // Prevent NoSQL Injection
app.disable('x-powered-by'); // Hide stack info

// Standard Rate Limiter: 500 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, 
    message: { success: false, message: "Security Notice: Rate limit exceeded. Please wait 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === "development" && (req.ip === "127.0.0.1" || req.ip === "::1"),
});

// Stricter Rate Limiter for AUTH: 10 attempts per minute
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Security Notice: Too many login attempts. Please try again after 1 minute." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(compression()); // Compress all responses
app.use(limiter); // Apply rate limiting to all requests
app.use(logger);
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            "https://pgmanagmentsystem.netlify.app",
            "http://localhost:5173",
            "http://localhost:8000",
            "http://127.0.0.1:5173"
        ].filter(Boolean);
        
        // Block invalid origins in production
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            const isProd = process.env.NODE_ENV === "production";
            if (isProd) {
                callback(new Error("CORS Policy: Origin not allowed"), false);
            } else {
                callback(null, true); 
            }
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global Request Timeout Middleware (30 seconds)
app.use((req, res, next) => {
    res.setTimeout(30000, () => {
        if (!res.headersSent) {
            res.status(503).json({ success: false, message: "Request Timeout - Server busy" });
        }
    });
    next();
});

// Health check
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({ success: true, message: "PG Manager API is running", timestamp: new Date().toISOString() });
});

// Static resources
app.use("/bills", express.static(path.join(__dirname, "../../bills")));
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Setting up Routes
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/rooms", roomRoutes);
app.use("/api/v1/tenants", tenantRoutes);
app.use("/api/v1/bills", billingRoutes);
app.use("/api/v1/menu", foodRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/complaints", complaintRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/visitors", visitorLogRoutes);
app.use("/api/v1/expenses", expenseRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
