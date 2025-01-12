"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAgent = runAgent;
const generative_ai_1 = require("@google/generative-ai");
const logger_1 = __importDefault(require("../config/logger"));
const secret_1 = require("../secret");
const utils_1 = require("../utils");
async function runAgent(schema, prompt) {
    let currentApiKeyIndex = 0;
    let geminiApiKey = secret_1.geminiApiKeys[currentApiKeyIndex];
    if (!geminiApiKey) {
        logger_1.default.error("No Gemini API key available.");
        return "No API key available.";
    }
    const generationConfig = {
        responseMimeType: "application/json",
        responseSchema: schema,
    };
    const googleAI = new generative_ai_1.GoogleGenerativeAI(geminiApiKey);
    const model = googleAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig,
    });
    try {
        const result = await model.generateContent(prompt);
        if (!result || !result.response) {
            logger_1.default.info("No response received from the AI model. || Service Unavailable");
            return "Service unavailable!";
        }
        const responseText = result.response.text();
        const data = JSON.parse(responseText);
        return data;
    }
    catch (error) {
        await (0, utils_1.handleError)(error, currentApiKeyIndex, schema, prompt, runAgent);
    }
}
