// src/middleware/sanitize.js
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";

export const sanitizeInput = [
  mongoSanitize(), // Prevent NoSQL Injection
  xss(), // Prevent XSS attacks
];
