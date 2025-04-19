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

const router = express.Router();

// Existing routes
router.route("/").post(registerUser).get(protect, admin, getUsers);
router.post("/logout", protect, logoutUser);
router.post("/login", authUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router
  .route("/:id")
  .get(protect, admin, getUserById)
  .delete(protect, admin, deleteUser)
  .put(protect, admin, updateUser);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password/:token", passwordResetLimiter, resetPassword);

// New 2FA routes
router.post("/two-factor/generate", protect, generateTwoFactorSecret);
router.post("/two-factor/verify", protect, verifyAndEnableTwoFactor);
router.post("/two-factor/disable", protect, disableTwoFactor);
router.post("/two-factor/validate", validateTwoFactorAuth);

export default router;
