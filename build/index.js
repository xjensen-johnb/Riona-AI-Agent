"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const Instagram_1 = require("./client/Instagram");
const logger_1 = __importStar(require("./config/logger"));
const utils_1 = require("./utils");
// import { main as twitterMain } from './client/Twitter'; //
// import { main as githubMain } from './client/GitHub'; // 
// Set up process-level error handlers
(0, logger_1.setupErrorHandlers)();
const runAgents = async () => {
    logger_1.default.info("Starting Instagram agent...");
    await (0, Instagram_1.runInstagram)();
    logger_1.default.info("Instagram agent finished.");
    // logger.info("Starting Twitter agent...");
    // await twitterMain();
    // logger.info("Twitter agent finished.");
    // logger.info("Starting GitHub agent...");
    // await githubMain();
    // .log("GitHub agent finished.");
};
runAgents().catch(error => {
    (0, utils_1.setup_HandleError)(error, "Error running agents:");
});
