import express from "express";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import goalRoutes from "./routes/goalRoutes.js";
dotenv.config();
const port = process.env.PORT || 5000;

connectDB();

const app = express();
app.use(express.json());

app.use("/api/goals", goalRoutes);
app.use(notFound);
app.use(errorHandler);

app
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  })
  .on("error", (err) => {
    console.error("Failed to start server:", err);
  });
