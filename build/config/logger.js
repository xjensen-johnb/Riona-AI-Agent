"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupErrorHandlers = setupErrorHandlers;
const winston_1 = require("winston");
require("winston-daily-rotate-file");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("../utils");
// Ensure the logs directory exists
const logDir = path_1.default.join(__dirname, '../logs');
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
// Define log levels and their corresponding colors
const logLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'blue',
    },
};
// Custom function to format the timestamp
const customTimestamp = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds} ${ampm}`;
    return formattedTime;
};
// Function to get emojis based on log level
const getEmojiForLevel = (level) => {
    switch (level) {
        case 'info':
            return '💡'; // Light bulb for info
        case 'error':
            return '🚨'; // Emergency for errors
        case 'warn':
            return '⚠️'; // Warning for warnings
        case 'debug':
            return '🐞'; // Bug for debug
        default:
            return '🔔'; // Default bell emoji
    }
};
const logger = (0, winston_1.createLogger)({
    levels: logLevels.levels,
    format: winston_1.format.combine(winston_1.format.timestamp({ format: customTimestamp }), winston_1.format.colorize(), winston_1.format.printf(({ timestamp, level, message }) => {
        const emoji = getEmojiForLevel(level);
        return `${timestamp} ${emoji} [${level}]: ${message}`;
    })),
    transports: [
        new winston_1.transports.Console({
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple()),
        }),
        new winston_1.transports.DailyRotateFile({
            filename: "logs/%DATE%-combined.log",
            datePattern: "YYYY-MM-DD",
            level: "info",
            maxFiles: "14d", // Keep logs for the last 14 days
            maxSize: "20m", // Maximum log file size before rotation (20MB)
            zippedArchive: true, // Compress old log files
            format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
        }), // Daily rotating log file for general info
        new winston_1.transports.DailyRotateFile({
            filename: "logs/%DATE%-error.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            maxFiles: "14d", // Keep logs for the last 14 days
            maxSize: "20m", // Maximum log file size before rotation (20MB)
            zippedArchive: true, // Compress old log files
            format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
        }), // Daily rotating error log
        new winston_1.transports.DailyRotateFile({
            filename: "logs/%DATE%-debug.log",
            datePattern: "YYYY-MM-DD",
            level: "debug",
            maxFiles: "14d", // Keep logs for the last 14 days
            maxSize: "20m", // Maximum log file size before rotation (20MB)
            zippedArchive: true, // Compress old log files
            format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
        }), // Daily rotating debug log
    ],
});
// Catch unhandled promise rejections
function setupErrorHandlers() {
    // Catch unhandled promise rejections
    process.on("unhandledRejection", (error) => {
        (0, utils_1.setup_HandleError)(error, "Unhandled Rejection");
        process.exit(1);
    });
    // Catch uncaught exceptions
    process.on("uncaughtException", (error) => {
        (0, utils_1.setup_HandleError)(error, "Uncaught Exception");
        process.exit(1);
    });
    // Catch process warnings
    process.on("warning", (warning) => {
        logger.warn(`Warning: ${warning.message || warning}`);
    });
}
exports.default = logger;
