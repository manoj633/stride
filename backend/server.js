// Core Node.js modules
import path from "path";
import { fileURLToPath } from "url";

// Third-party libraries
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
// import helmet from "helmet";

// Custom modules and utilities
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { sanitizeInput } from "./middleware/sanitize.js";
import { limiter } from "./middleware/rateLimiter.js";
import logger from "./utils/logger.js";
import { initScheduler } from "./utils/scheduler.js";

// Routes
import goalRoutes from "./routes/goalRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import subtaskRoutes from "./routes/subtaskRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Configure directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const port = process.env.PORT || 5000;

connectDB();

const app = express();
initScheduler();
app.use(
  cors({
    origin: "https://stride-qd71.onrender.com",
    credentials: true,
  })
);
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Cookie parser middleware
app.use(cookieParser());
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         connectSrc: ["'self'", process.env.REACT_APP_API_URL],
//         scriptSrc: ["'self'", "'unsafe-inline'"],
//         styleSrc: ["'self'", "'unsafe-inline'"],
//         imgSrc: ["'self'", "data:", "https:"],
//         fontSrc: ["'self'", "https:", "data:"],
//       },
//     },
//   })
// );
app.use(sanitizeInput);

// Configure Winston logger
// const logger = winston.createLogger({
//   level: "info",
//   format: winston.format.combine(
//     winston.format.colorize(),
//     winston.format.simple()
//   ),
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: "server.log" }),
//   ],
// });

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
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
  try {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("*", (req, res) =>
      res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"))
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
