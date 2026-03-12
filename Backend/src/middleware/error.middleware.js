exports.asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

exports.errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);
    
    // Check for Mongoose connection/timeout errors
    if (err.name === 'MongooseServerSelectionError' || err.message.includes('buffering timed out')) {
        return res.status(503).json({
            success: false,
            message: "Database connection busy or unavailable. Please try again in 10-15 seconds.",
            retryAfter: 15
        });
    }

    const isProduction = process.env.NODE_ENV === "production";

    if (!isProduction) {
        console.error(err.stack);
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Server Error",
        ...(!isProduction && { path: req.originalUrl, stack: err.stack })
    });
};
