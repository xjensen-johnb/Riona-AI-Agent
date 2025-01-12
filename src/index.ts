
import { runInstagram } from './client/Instagram';
import logger, { setupErrorHandlers } from './config/logger';
import { setup_HandleError } from './utils';
// import { main as twitterMain } from './client/Twitter'; //
// import { main as githubMain } from './client/GitHub'; // 

// Set up process-level error handlers
setupErrorHandlers();


const runAgents = async () => {
    logger.info("Starting Instagram agent...");
    await runInstagram();
    logger.info("Instagram agent finished.");

    // logger.info("Starting Twitter agent...");
    // await twitterMain();
    // logger.info("Twitter agent finished.");

    // logger.info("Starting GitHub agent...");
    // await githubMain();
    // .log("GitHub agent finished.");
};

runAgents().catch(error => {
    setup_HandleError(error , "Error running agents:");
})