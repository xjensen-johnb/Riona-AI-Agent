
import dotenv from "dotenv";
import logger from "./config/logger";
import { shutdown } from "./services";
import app from "./app";

dotenv.config();

const server = app.listen(process.env.PORT || 3000, () => {
  logger.info(`Server is running on port ${process.env.PORT || 3000}`);
});

process.on("SIGTERM", () => {
  logger.info("Received SIGTERM signal.");
  shutdown(server);
});
process.on("SIGINT", () => {
  logger.info("Received SIGINT signal.");
  shutdown(server);
});
