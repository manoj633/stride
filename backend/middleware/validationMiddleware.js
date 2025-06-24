// Centralized validation middleware using express-validator
import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Map errors to a simple array of messages
    const errorMessages = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
    }));
    return res.status(400).json({ errors: errorMessages });
  }
  next();
};
