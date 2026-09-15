import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: { type: String, required: true, minlength: 6, maxlength: 128 },
    isAdmin: { type: Boolean, required: true, default: false },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String, default: null },
    isTwoFactorEnabled: { type: Boolean, default: true },
    twoFactorSecret: { type: String, default: null },
    twoFactorBackupCodes: [{ type: String }], // bcrypt hashes, ~60 chars each
    lastActive: { type: Date, default: Date.now },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastTaskCompletedDate: { type: Date, default: null },
    totalTasksCompleted: { type: Number, default: 0 },
    totalGoalsCompleted: { type: Number, default: 0 },
    totalPomodorosCompleted: { type: Number, default: 0 },
    achievements: [{ type: String }],
  },
  { timestamps: true },
);

// Keep existing methods
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
export default User;
