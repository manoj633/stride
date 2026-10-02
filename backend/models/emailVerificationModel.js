// models/emailVerificationModel.js
import mongoose from "mongoose";
import crypto from "crypto";

const emailVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
    maxlength: 64,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Token expires after 24 hours (86400 seconds)
  },
});

// Generate a secure random token
emailVerificationSchema.statics.generateToken = function () {
  return crypto.randomBytes(32).toString("hex");
};

const EmailVerification = mongoose.model("EmailVerification", emailVerificationSchema);
export default EmailVerification;
