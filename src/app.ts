import express, { Application } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet"; // For securing HTTP headers
import cors from "cors";

import logger, { setupErrorHandlers } from "./config/logger";
import { setup_HandleError } from "./utils";
import { connectDB } from "./config/db";
import apiRoutes from "./routes/api";
// import { main as twitterMain } from './client/Twitter'; //
// import { main as githubMain } from './client/GitHub'; //

// Set up process-level error handlers
setupErrorHandlers();

// Initialize environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();

// Connect to the database
connectDB();

// Middleware setup
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'"],
        },
    },
}));
app.use(cors());
app.use(express.json()); // JSON body parsing
app.use(express.urlencoded({ extended: true, limit: "1kb" })); // URL-encoded data
app.use(cookieParser()); // Cookie parsing

// Serve static files from the 'public' directory
app.use(express.static('src/public'));

// API Routes
app.use('/api', apiRoutes);

/*
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
    await new Promise((resolve) => setTimeout(resolve, 30000));
  }
};

runAgents().catch((error) => {
  setup_HandleError(error, "Error running agents:");
});
*/

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Add SSR POST handler for exit-interactions
app.post('/panel/exit-interactions', async (req, res) => {
  try {
    const response = await fetch('http://localhost:3000/api/agent/exit-interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    res.redirect(`/panel?result=${encodeURIComponent(JSON.stringify(data, null, 2))}`);
  } catch (e) {
    res.redirect(`/panel?result=${encodeURIComponent('Error: ' + (e as Error).message)}`);
  }
});

app.get('/panel', (req, res) => {
  res.send(`
    <html>
      <head><title>Instagram AI Bot Control Panel</title></head>
      <body style="font-family:sans-serif;max-width:600px;margin:2rem auto;">
        <h1>Instagram AI Bot Control Panel</h1>
        <form method="post" action="/api/agent/scrape-followers">
          <input name="targetAccount" placeholder="Target Account" required />
          <input name="maxFollowers" type="number" placeholder="Max Followers" value="10" required />
          <button type="submit">Scrape & Download</button>
        </form>
        <hr />
        <!-- Other controls here -->
      </body>
    </html>
  `);
});

export default app;
