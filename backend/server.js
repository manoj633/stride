import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import winston from "winston"; // Import Winston
import helmet from "helmet";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import goalRoutes from "./routes/goalRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import subtaskRoutes from "./routes/subtaskRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

dotenv.config();
const port = process.env.PORT || 5000;

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());

// Configure Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "server.log" }),
  ],
});

// Use Winston to log server start
app
  .listen(port, () => {
    logger.info(`Server running on port ${port}`);
  })
  .on("error", (err) => {
    logger.error("Failed to start server:", err);
  });

// Use Winston to log errors
app.use((err, req, res, next) => {
  logger.error(err.stack);
  next(err);
});

app.use("/api/goals", goalRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/subtasks", subtaskRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/comments", commentRoutes);

app.use(notFound);
app.use(errorHandler);
