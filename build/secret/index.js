"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiApiKeys = exports.Xpassword = exports.Xusername = exports.IGpassword = exports.IGusername = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.IGusername = process.env.IGusername || "default_IGusername";
exports.IGpassword = process.env.IGpassword || "default_IGpassword";
exports.Xusername = process.env.Xusername || "default_Xusername";
exports.Xpassword = process.env.Xpassword || "default_Xpassword";
exports.geminiApiKeys = [
    process.env.GEMINI_API_KEY_1 || "API_KEY_1",
    process.env.GEMINI_API_KEY_2 || "API_KEY_2",
    process.env.GEMINI_API_KEY_3 || "API_KEY_3",
    process.env.GEMINI_API_KEY_4 || "API_KEY_4",
    process.env.GEMINI_API_KEY_5 || "API_KEY_5",
    process.env.GEMINI_API_KEY_6 || "API_KEY_6",
    process.env.GEMINI_API_KEY_7 || "API_KEY_7",
    process.env.GEMINI_API_KEY_8 || "API_KEY_8",
    process.env.GEMINI_API_KEY_9 || "API_KEY_9",
    process.env.GEMINI_API_KEY_10 || "API_KEY_10",
    process.env.GEMINI_API_KEY_11 || "API_KEY_11",
    process.env.GEMINI_API_KEY_12 || "API_KEY_12",
    process.env.GEMINI_API_KEY_13 || "API_KEY_13",
    process.env.GEMINI_API_KEY_14 || "API_KEY_14",
    process.env.GEMINI_API_KEY_15 || "API_KEY_15",
    process.env.GEMINI_API_KEY_16 || "API_KEY_16",
    process.env.GEMINI_API_KEY_17 || "API_KEY_17",
    process.env.GEMINI_API_KEY_18 || "API_KEY_18",
    process.env.GEMINI_API_KEY_19 || "API_KEY_19",
    process.env.GEMINI_API_KEY_20 || "API_KEY_20",
    process.env.GEMINI_API_KEY_21 || "API_KEY_21",
    process.env.GEMINI_API_KEY_22 || "API_KEY_22",
    process.env.GEMINI_API_KEY_23 || "API_KEY_23",
    process.env.GEMINI_API_KEY_24 || "API_KEY_24",
    process.env.GEMINI_API_KEY_25 || "API_KEY_25",
    process.env.GEMINI_API_KEY_26 || "API_KEY_26",
    process.env.GEMINI_API_KEY_27 || "API_KEY_27",
    process.env.GEMINI_API_KEY_28 || "API_KEY_28",
    process.env.GEMINI_API_KEY_29 || "API_KEY_29",
    process.env.GEMINI_API_KEY_30 || "API_KEY_30",
    process.env.GEMINI_API_KEY_31 || "API_KEY_31",
    process.env.GEMINI_API_KEY_32 || "API_KEY_32",
    process.env.GEMINI_API_KEY_33 || "API_KEY_33",
    process.env.GEMINI_API_KEY_34 || "API_KEY_34",
    process.env.GEMINI_API_KEY_35 || "API_KEY_35",
    process.env.GEMINI_API_KEY_36 || "API_KEY_36",
    process.env.GEMINI_API_KEY_37 || "API_KEY_37",
    process.env.GEMINI_API_KEY_38 || "API_KEY_38",
    process.env.GEMINI_API_KEY_39 || "API_KEY_39",
    process.env.GEMINI_API_KEY_40 || "API_KEY_40",
    process.env.GEMINI_API_KEY_41 || "API_KEY_41",
    process.env.GEMINI_API_KEY_42 || "API_KEY_42",
    process.env.GEMINI_API_KEY_43 || "API_KEY_43",
    process.env.GEMINI_API_KEY_44 || "API_KEY_44",
    process.env.GEMINI_API_KEY_45 || "API_KEY_45",
    process.env.GEMINI_API_KEY_46 || "API_KEY_46",
    process.env.GEMINI_API_KEY_47 || "API_KEY_47",
    process.env.GEMINI_API_KEY_48 || "API_KEY_48",
    process.env.GEMINI_API_KEY_49 || "API_KEY_49",
    process.env.GEMINI_API_KEY_50 || "API_KEY_50",
];
