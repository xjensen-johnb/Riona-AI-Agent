import { IgClient } from './IG-bot/IgClient';
import logger from '../config/logger';

let igClient: IgClient | null = null;

export const getIgClient = async (): Promise<IgClient> => {
    if (!igClient) {
        igClient = new IgClient();
        try {
            await igClient.init();
    } catch (error) {
            logger.error("Failed to initialize Instagram client", error);
    throw error;
        }
    }
    return igClient;
};

export const closeIgClient = async () => {
    if (igClient) {
        await igClient.close();
        igClient = null;
    }
};

export { scrapeFollowersHandler } from './IG-bot/IgClient'; 