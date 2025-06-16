// scripts/runGoalReminders.js
import { sendGoalReminders } from "../utils/goalReminder.js";
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
      await sendGoalReminders();
      logger.info("Goal reminders sent successfully");
    } catch (error) {
      logger.error("Error sending goal reminders", { error });
    } finally {
      mongoose.disconnect();
    }
  })
  .catch((err) => {
    logger.error("MongoDB connection error", { error: err.message });
    process.exit(1);
  });
