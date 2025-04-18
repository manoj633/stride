// models/passwordResetModel.js
import mongoose from "mongoose";
import crypto from "crypto";

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Token expires after 1 hour
  },
});

// Generate a secure random token
passwordResetSchema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString("hex");
};

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);
export default PasswordReset;
