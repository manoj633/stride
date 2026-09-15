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
  generateTwoFactorSecret,
  verifyAndEnableTwoFactor,
  disableTwoFactor,
  validateTwoFactorAuth,
  recoverWithBackupCode,
  completePomodoro,
  getAdminStats,
  getAuditLogs,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { passwordResetLimiter, loginLimiter, registerLimiter, twoFactorLimiter } from "../middleware/rateLimiter.js";
import { check } from "express-validator";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Existing routes
router
  .route("/")
  .post(
    [
      registerLimiter,
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
    loginLimiter,
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

// Admin stats route (must come before /:id)
router.get("/admin/stats", protect, admin, getAdminStats);
router.get("/admin/audit-logs", protect, admin, getAuditLogs);

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
router.post("/two-factor/verify", protect, twoFactorLimiter, verifyAndEnableTwoFactor);
router.post("/two-factor/disable", protect, disableTwoFactor);
router.post("/two-factor/validate", twoFactorLimiter, validateTwoFactorAuth);
router.post("/recover-with-backup-code", passwordResetLimiter, recoverWithBackupCode);
router.post("/pomodoro/complete", protect, completePomodoro);

export default router;
