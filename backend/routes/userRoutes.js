import express from "express";
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  // Add new imports
  generateTwoFactorSecret,
  verifyAndEnableTwoFactor,
  disableTwoFactor,
  validateTwoFactorAuth,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { passwordResetLimiter } from "../middleware/rateLimiter.js";
import { check } from "express-validator";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Existing routes
router
  .route("/")
  .post(
    [
      check("name")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be 2-50 characters"),
      check("email")
        .trim()
        .isEmail()
        .withMessage("Valid email is required")
        .isLength({ max: 100 })
        .toLowerCase(),
      check("password")
        .isLength({ min: 6, max: 128 })
        .withMessage("Password must be 6-128 characters"),
      validate,
    ],
    registerUser
  )
  .get(protect, admin, getUsers);
router.post("/logout", protect, logoutUser);
router.post(
  "/login",
  [
    check("email")
      .trim()
      .isEmail()
      .withMessage("Valid email is required")
      .isLength({ max: 100 })
      .toLowerCase(),
    check("password").notEmpty().withMessage("Password is required"),
    validate,
  ],
  authUser
);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router
  .route("/:id")
  .get(protect, admin, getUserById)
  .delete(protect, admin, deleteUser)
  .put(
    [
      protect,
      admin,
      check("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be 2-50 characters"),
      check("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Valid email is required")
        .isLength({ max: 100 })
        .toLowerCase(),
      check("password")
        .optional()
        .isLength({ min: 6, max: 128 })
        .withMessage("Password must be 6-128 characters"),
      validate,
    ],
    updateUser
  );
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password/:token", passwordResetLimiter, resetPassword);

// New 2FA routes
router.post("/two-factor/generate", protect, generateTwoFactorSecret);
router.post("/two-factor/verify", protect, verifyAndEnableTwoFactor);
router.post("/two-factor/disable", protect, disableTwoFactor);
router.post("/two-factor/validate", validateTwoFactorAuth);

export default router;
