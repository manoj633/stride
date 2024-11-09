import express from "express";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";

import goalRoutes from "./routes/goalRoutes.js";

const port = process.env.PORT || 5000;

connectDB();

const app = express();
app.use(express.json());

app
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  })
  .on("error", (err) => {
    console.error("Failed to start server:", err);
  });

app.use("/api/goals", goalRoutes);
