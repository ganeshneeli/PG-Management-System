const winston = require("winston");

const loggerInstance = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: "error.log", level: "error" }),
        new winston.transports.File({ filename: "combined.log" }),
    ],
});

if (process.env.NODE_ENV !== "production") {
    loggerInstance.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }));
}

exports.logger = (req, res, next) => {
    loggerInstance.info(`${req.method} ${req.originalUrl}`);
    next();
};

exports.winstonLogger = loggerInstance;
