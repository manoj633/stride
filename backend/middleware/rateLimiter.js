// src/middleware/rateLimiter.js
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 3, // limit to 3 requests per window
  message: "Too many password reset attempts. Please try again after an hour.",
  standardHeaders: true,
  legacyHeaders: false,
});

export { limiter, passwordResetLimiter };
