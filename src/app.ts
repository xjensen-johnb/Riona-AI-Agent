import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet'; // For securing HTTP headers

import { runInstagram } from './client/Instagram';
import logger, { setupErrorHandlers } from './config/logger';
import { setup_HandleError } from './utils';
import { connectDB } from './config/db';
// import { main as twitterMain } from './client/Twitter'; //
// import { main as githubMain } from './client/GitHub'; // 

// Set up process-level error handlers
setupErrorHandlers();

// Initialize environment variables
dotenv.config();

const app: Application = express();

// Connect to the database
connectDB();

// Middleware setup
app.use(helmet({ xssFilter: true, noSniff: true })); // Security headers
app.use(express.json()); // JSON body parsing
app.use(express.urlencoded({ extended: true, limit: '1kb' })); // URL-encoded data
app.use(cookieParser()); // Cookie parsing

const runAgents = async () => {
    while (true) {
        logger.info("Starting Instagram agent iteration...");
        await runInstagram();
        logger.info("Instagram agent iteration finished.");

        // logger.info("Starting Twitter agent...");
        // await twitterMain();
        // logger.info("Twitter agent finished.");

        // logger.info("Starting GitHub agent...");
        // await githubMain();
        // logger.info("GitHub agent finished.");

        // Wait for 30 seconds before next iteration
        await new Promise(resolve => setTimeout(resolve, 30000));
    }
};

runAgents().catch(error => {
    setup_HandleError(error , "Error running agents:");
});

export default app;
