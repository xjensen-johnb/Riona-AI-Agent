"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextApiKey = void 0;
exports.Instagram_cookiesExist = Instagram_cookiesExist;
exports.saveCookies = saveCookies;
exports.loadCookies = loadCookies;
exports.handleError = handleError;
exports.setup_HandleError = setup_HandleError;
const fs_1 = require("fs");
const secret_1 = require("../secret");
const logger_1 = __importDefault(require("../config/logger"));
async function Instagram_cookiesExist() {
    try {
        let cookiesPath = "./cookies/Instagramcookies.json";
        // Check if the file exists
        await fs_1.promises.access(cookiesPath);
        const cookiesData = await fs_1.promises.readFile(cookiesPath, "utf-8");
        const cookies = JSON.parse(cookiesData);
        // Find the sessionid cookie
        const sessionIdCookie = cookies.find((cookie) => cookie.name === 'sessionid');
        // If sessionid cookie is not found, return false
        if (!sessionIdCookie)
            return false;
        // Check if the sessionid cookie has expired
        const currentTimestamp = Math.floor(Date.now() / 1000);
        return sessionIdCookie.expires > currentTimestamp;
    }
    catch (error) {
        logger_1.default.error("Error checking cookies:", error);
        return false;
    }
}
async function saveCookies(cookiesPath, cookies) {
    try {
        await fs_1.promises.writeFile(cookiesPath, JSON.stringify(cookies, null, 2));
        logger_1.default.info("Cookies saved successfully.");
    }
    catch (error) {
        logger_1.default.error("Error saving cookies:", error);
        throw new Error("Failed to save cookies.");
    }
}
async function loadCookies(cookiesPath) {
    try {
        // Check if the file exists
        await fs_1.promises.access(cookiesPath);
        // Read and parse the cookies file
        const cookiesData = await fs_1.promises.readFile(cookiesPath, "utf-8");
        const cookies = JSON.parse(cookiesData);
        return cookies;
    }
    catch (error) {
        logger_1.default.error("Cookies file does not exist or cannot be read.", error);
        return [];
    }
}
// Function to get the next API key in the list
const getNextApiKey = (currentApiKeyIndex) => {
    currentApiKeyIndex = (currentApiKeyIndex + 1) % secret_1.geminiApiKeys.length; // Circular rotation of API keys
    return secret_1.geminiApiKeys[currentApiKeyIndex];
};
exports.getNextApiKey = getNextApiKey;
async function handleError(error, currentApiKeyIndex, schema, prompt, runAgent) {
    if (error instanceof Error) {
        if (error.message.includes("429 Too Many Requests")) {
            logger_1.default.error(`---GEMINI_API_KEY_${currentApiKeyIndex + 1} limit exhausted, switching to the next API key...`);
            const geminiApiKey = (0, exports.getNextApiKey)(currentApiKeyIndex);
            const currentApiKeyName = `GEMINI_API_KEY_${currentApiKeyIndex + 1}`;
            return runAgent(schema, prompt);
        }
        else if (error.message.includes("503 Service Unavailable")) {
            logger_1.default.error("Service is temporarily unavailable. Retrying...");
            await new Promise(resolve => setTimeout(resolve, 5000));
            return runAgent(schema, prompt);
        }
        else {
            logger_1.default.error(`Error generating training prompt: ${error.message}`);
            return `An error occurred: ${error.message}`;
        }
    }
    else {
        logger_1.default.error("An unknown error occurred:", error);
        return "An unknown error occurred.";
    }
}
function setup_HandleError(error, context) {
    if (error instanceof Error) {
        if (error.message.includes("net::ERR_ABORTED")) {
            logger_1.default.error(`ABORTION error occurred in ${context}: ${error.message}`);
        }
        else {
            logger_1.default.error(`Error in ${context}: ${error.message}`);
        }
    }
    else {
        logger_1.default.error(`An unknown error occurred in ${context}: ${error}`);
    }
}
