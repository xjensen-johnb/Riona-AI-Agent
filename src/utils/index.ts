import { promises as fs } from "fs";
import { geminiApiKeys } from "../secret";
import logger from "../config/logger";

export async function Instagram_cookiesExist(): Promise<boolean> {
    try {
        let cookiesPath ="./cookies/Instagramcookies.json"
        // Check if the file exists
        await fs.access(cookiesPath);
        
        const cookiesData = await fs.readFile(cookiesPath, "utf-8");
        const cookies = JSON.parse(cookiesData);

        // Find the sessionid cookie
        const sessionIdCookie = cookies.find((cookie: { name: string }) => cookie.name === 'sessionid');

        // If sessionid cookie is not found, return false
        if (!sessionIdCookie) return false;

        // Check if the sessionid cookie has expired
        const currentTimestamp = Math.floor(Date.now() / 1000);
        return sessionIdCookie.expires > currentTimestamp;
    } catch (error) {
        logger.error("Error checking cookies:", error);
        return false;
    }
}


export async function saveCookies(cookiesPath: string, cookies: any[]): Promise<void> {
    try {
        await fs.writeFile(cookiesPath, JSON.stringify(cookies, null, 2));
        logger.info("Cookies saved successfully.");
    } catch (error) {
        logger.error("Error saving cookies:", error);
        throw new Error("Failed to save cookies.");
    }
}

export async function loadCookies(cookiesPath: string): Promise<any[]> {
    try {
        // Check if the file exists
        await fs.access(cookiesPath);
        
        // Read and parse the cookies file
        const cookiesData = await fs.readFile(cookiesPath, "utf-8");
        const cookies = JSON.parse(cookiesData);
        return cookies;
    } catch (error) {
        logger.error("Cookies file does not exist or cannot be read.", error);
        return [];
    }
}

// Function to get the next API key in the list
export const getNextApiKey = (currentApiKeyIndex: number) => {
  currentApiKeyIndex = (currentApiKeyIndex + 1) % geminiApiKeys.length; // Circular rotation of API keys
  return geminiApiKeys[currentApiKeyIndex];
};


export async function handleError(error: unknown, currentApiKeyIndex: number, schema: any, prompt: string, runAgent: (schema: any, prompt: string) => Promise<string>): Promise<string> {
    if (error instanceof Error) {
        if (error.message.includes("429 Too Many Requests")) {
            logger.error(`---GEMINI_API_KEY_${currentApiKeyIndex + 1} limit exhausted, switching to the next API key...`);
            const geminiApiKey = getNextApiKey(currentApiKeyIndex);
            const currentApiKeyName = `GEMINI_API_KEY_${currentApiKeyIndex + 1}`;
            return runAgent(schema, prompt);
        } else if (error.message.includes("503 Service Unavailable")) {
            logger.error( "Service is temporarily unavailable. Retrying...");
            await new Promise(resolve => setTimeout(resolve, 5000));
            return runAgent(schema, prompt);
        } else {
        logger.error(`Error generating training prompt: ${error.message}`);
            return `An error occurred: ${error.message}`;
        }
    } else {
      logger.error("An unknown error occurred:", error);
        return "An unknown error occurred.";
    }
}


export function setup_HandleError(error: unknown, context: string): void {
    if (error instanceof Error) {
        if (error.message.includes("net::ERR_ABORTED")) {
            logger.error(`ABORTION error occurred in ${context}: ${error.message}`);
        } else {
            logger.error(`Error in ${context}: ${error.message}`);
        }
    } else {
        logger.error(`An unknown error occurred in ${context}: ${error}`);
    }
}