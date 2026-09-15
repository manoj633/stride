// src/middleware/rateLimiter.js
import rateLimit from "express-rate-limit";
import RateLimitLog from "../models/rateLimitLogModel.js";

const createRateLimitHandler = (limiterName, defaultMessage) => {
  return (req, res, _next, options) => {
    const ip =
      req.ip ||
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown";
    const email = req.body?.email
      ? String(req.body.email).toLowerCase().trim()
      : null;
    const endpoint = req.originalUrl || req.url || "unknown";
    const userAgent = req.headers["user-agent"] || null;

    RateLimitLog.create({
      limiter: limiterName,
      ip,
      email,
      endpoint,
      userAgent,
      blockedAt: new Date(),
    }).catch((err) => {
      console.error(
        `Failed to log rate limit hit for ${limiterName}:`,
        err.message
      );
    });

    const statusCode = options?.statusCode || 429;
    const message = options?.message || defaultMessage;
    res.status(statusCode).json({ message });
  };
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 3, // limit to 3 requests per window
  message: "Too many password reset attempts. Please try again after an hour.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "passwordResetLimiter",
    "Too many password reset attempts. Please try again after an hour."
  ),
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login requests per windowMs
  message: "Too many login attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "loginLimiter",
    "Too many login attempts. Please try again after 15 minutes."
  ),
});

const twoFactorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 2FA verification attempts per windowMs
  message:
    "Too many 2FA verification attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "twoFactorLimiter",
    "Too many 2FA verification attempts. Please try again after 15 minutes."
  ),
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 registration requests per windowMs
  message: "Too many registration attempts. Please try again after an hour.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "registerLimiter",
    "Too many registration attempts. Please try again after an hour."
  ),
});

const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 comments per hour
  message:
    "Too many comments created from this IP, please try again after an hour.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    "commentLimiter",
    "Too many comments created from this IP, please try again after an hour."
  ),
});

export {
  limiter,
  passwordResetLimiter,
  loginLimiter,
  twoFactorLimiter,
  registerLimiter,
  commentLimiter,
};
