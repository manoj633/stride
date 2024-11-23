import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import winston from "winston"; // Import Winston
import helmet from "helmet";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { sanitizeInput } from "./middleware/sanitize.js";

import goalRoutes from "./routes/goalRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import subtaskRoutes from "./routes/subtaskRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import limiter from "./middleware/rateLimiter.js";

dotenv.config();
const port = process.env.PORT || 5000;

connectDB();

const app = express();
app.use(cors());
app.use(limiter);
app.use(express.json());
app.use(helmet());
app.use(sanitizeInput);

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

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
  try {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.get("*", (req, res) =>
      res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
    );
  } catch (error) {
    console.error("Error serving static files:", error);
  }
} else {
  app.get("/", (req, res) => {
    res.send("API is running....");
  });
}

app.use(notFound);
app.use(errorHandler);
