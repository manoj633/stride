// scripts/triggerWeeklyReports.js
import { generateAndSendWeeklyReports } from "../utils/weeklyReportGenerator.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

// Connect to database
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    logger.info("Connected to MongoDB");

    try {
      await generateAndSendWeeklyReports();
      logger.info("Report generation completed");
    } catch (error) {
      logger.error("Error generating reports", { error });
    } finally {
      mongoose.disconnect();
    }
  })
  .catch((err) => {
    logger.error("MongoDB connection error", { error: err.message });
    process.exit(1);
  });
