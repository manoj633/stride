import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import PasswordReset from "../models/passwordResetModel.js";
import EmailVerification from "../models/emailVerificationModel.js";
import sendEmail from "../utils/emailService.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyUserStreakActive, handlePomodoroCompletionXP } from "../utils/gamification.js";
import Goal from "../models/goalModel.js";
import Task from "../models/taskModel.js";
import Subtask from "../models/subtaskModel.js";
import Comment from "../models/commentModel.js";
import Notification from "../models/notificationModel.js";
import WeeklyReport from "../models/weeklyReportModel.js";
import PomodoroSession from "../models/pomodoroSessionModel.js";
import AiLog from "../models/AiLog.js";
import AuditLog from "../models/auditLogModel.js";
import logAdminAction from "../utils/auditLogger.js";
import { checkAndTriggerYearInReviewNotification } from "../utils/yearInReviewNotification.js";

//@desc     Auth User & get token
//@route    POST /api/users/login
//@access   Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (user.isSuspended) {
      res.status(403);
      throw new Error(
        user.suspensionReason
          ? `Account suspended: ${user.suspensionReason}`
          : "Your account has been suspended. Please contact support."
      );
    }

    if (!user.isEmailVerified) {
      res.status(403);
      throw new Error(
        "Please verify your email address before logging in. Check your inbox for the verification link."
      );
    }

    // Update lastActive on login
    user.lastActive = new Date();
    verifyUserStreakActive(user);
    await user.save();

    await checkAndTriggerYearInReviewNotification(user._id);

    // Check if 2FA has been completed
    if (user.isTwoFactorEnabled) {
      // 2FA is active, prompt for 6-digit TOTP code (no cookie yet)
      return res.status(200).json({
        _id: user._id,
        email: user.email,
        requiresTwoFactor: true,
      });
    }

    // If 2FA has not been completed yet (e.g. user verified email but abandoned onboarding before scanning QR code),
    // resume 2FA onboarding instead of locking them out demanding an unconfigured code!
    let secretBase32 = user.twoFactorSecret;
    let otpauthUrl;
    if (!secretBase32) {
      const secret = speakeasy.generateSecret({
        name: `Stride:${user.email}`,
      });
      secretBase32 = secret.base32;
      user.twoFactorSecret = secretBase32;
      await user.save();
      otpauthUrl = secret.otpauth_url;
    } else {
      otpauthUrl = speakeasy.otpauthURL({
        secret: secretBase32,
        label: `Stride:${user.email}`,
        issuer: "Stride",
        encoding: "base32",
      });
    }

    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);
    const setupToken = jwt.sign(
      { userId: user._id, purpose: "2fa-setup" },
      process.env.JWT_KEY,
      { expiresIn: "30m" }
    );

    return res.status(200).json({
      requiresTwoFactorSetup: true,
      email: user.email,
      setupToken,
      twoFactorAuthSetup: {
        qrCodeUrl,
        otpauthUrl,
        secret: secretBase32,
      },
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

//@desc     Register user
// Helper: send verification email
const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <h1 style="color: #2563eb; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Welcome to Stride</h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Please confirm your email address</p>
      </div>
      
      <div style="padding: 28px 4px;">
        <p style="color: #1e293b; font-size: 16px; margin-top: 0;">Hi ${user.name},</p>
        
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Thank you for signing up for Stride. To activate your account and start using your workspace, please confirm that this is your email address by clicking the button below:
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 8px;">
          This verification link will expire in 24 hours.
        </p>
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
          If you did not sign up for Stride, please ignore this email.
        </p>
        
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 13px;">
          <p style="margin: 0;">Best regards,<br><strong>The Stride Team</strong></p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: "Verify your Stride account email",
    html,
  });
};

//@desc     Register user
//@route    POST /api/users
//@access   Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email ? email.toLowerCase().trim() : "";

  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    if (!userExists.isEmailVerified) {
      // Re-send verification email if user previously signed up but did not verify
      await EmailVerification.deleteMany({ userId: userExists._id });
      const token = EmailVerification.generateToken();
      await EmailVerification.create({
        userId: userExists._id,
        token,
      });

      try {
        await sendVerificationEmail(userExists, token);
      } catch (err) {
        console.error("Failed to resend verification email:", err);
      }

      return res.status(200).json({
        message: "An unverified account already exists with this email. A new verification link has been sent to your inbox.",
        email: userExists.email,
        isEmailVerified: false,
      });
    }

    res.status(400);
    throw new Error("User already exists with this email address");
  }

  // Create new user with isEmailVerified: false
  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    isEmailVerified: false,
    isTwoFactorEnabled: false,
    lastActive: new Date(),
  });

  // Generate verification token and store in database
  const token = EmailVerification.generateToken();
  await EmailVerification.create({
    userId: user._id,
    token,
  });

  // Send verification email
  try {
    await sendVerificationEmail(user, token);
  } catch (err) {
    console.error("Failed to send verification email on signup:", err);
  }

  res.status(201).json({
    message: "Registration successful! A verification link has been sent to your email. Please check your inbox and verify your email before logging in.",
    email: user.email,
    isEmailVerified: false,
  });
});

//@desc     Logout  / clear cookie
//@route    POST /api/users/logout
//@access   Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

//@desc     Get user profile
//@route    GET /api/users/profile
//@access   Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    verifyUserStreakActive(user);
    await user.save();

    await checkAndTriggerYearInReviewNotification(user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || 0,
      totalTasksCompleted: user.totalTasksCompleted || 0,
      totalGoalsCompleted: user.totalGoalsCompleted || 0,
      totalPomodorosCompleted: user.totalPomodorosCompleted || 0,
      achievements: user.achievements || [],
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//@desc     Update user profile
//@route    PUT /api/users/profile
//@access   Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    verifyUserStreakActive(user);
    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      xp: updatedUser.xp || 0,
      level: updatedUser.level || 1,
      streak: updatedUser.streak || 0,
      totalTasksCompleted: updatedUser.totalTasksCompleted || 0,
      totalGoalsCompleted: updatedUser.totalGoalsCompleted || 0,
      totalPomodorosCompleted: updatedUser.totalPomodorosCompleted || 0,
      achievements: updatedUser.achievements || [],
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//@desc     Delete self user account & cascade all personal data (GDPR Art. 17 Right to Erasure)
//@route    DELETE /api/users/profile
//@access   Private
const deleteSelfAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const userId = req.user._id;

  if (!password) {
    res.status(400);
    throw new Error("Please enter your current password to confirm account deletion.");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Re-verify password for security
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Incorrect password. Account deletion aborted.");
  }

  // Safeguard: Cannot delete if sole admin
  if (user.isAdmin && (await User.countDocuments({ isAdmin: true })) <= 1) {
    res.status(400);
    throw new Error(
      "Cannot delete account: You are the sole administrator. Please assign or promote another administrator before deleting your account."
    );
  }

  // Cascade cleanup across all associated collections:
  // 1. Find all goals created by this user
  const userGoals = await Goal.find({ createdBy: user._id }).select("_id");
  const userGoalIds = userGoals.map((g) => g._id);

  // 2. Find all tasks created by user OR linked to user's goals
  const userTasks = await Task.find({
    $or: [{ createdBy: user._id }, { goalId: { $in: userGoalIds } }],
  }).select("_id");
  const userTaskIds = userTasks.map((t) => t._id);

  // 3. Cascade delete subtasks
  const deletedSubtasks = await Subtask.deleteMany({
    $or: [
      { createdBy: user._id },
      { goalId: { $in: userGoalIds } },
      { taskId: { $in: userTaskIds } },
    ],
  });

  // 4. Cascade delete tasks
  const deletedTasks = await Task.deleteMany({
    $or: [{ createdBy: user._id }, { goalId: { $in: userGoalIds } }],
  });

  // 5. Cascade delete comments
  const deletedComments = await Comment.deleteMany({
    $or: [{ authorId: user._id }, { goalId: { $in: userGoalIds } }],
  });

  // 6. Cascade delete goals
  const deletedGoals = await Goal.deleteMany({ createdBy: user._id });

  // 7. Prune collaborator references on other goals
  await Goal.updateMany(
    { collaborators: user._id },
    { $pull: { collaborators: user._id } }
  );

  // 8. Cascade delete notifications
  const deletedNotifications = await Notification.deleteMany({ user: user._id });

  // 9. Cascade delete weekly reports
  const deletedWeeklyReports = await WeeklyReport.deleteMany({ user: user._id });

  // 10. Cascade delete pomodoro sessions
  const deletedPomodoros = await PomodoroSession.deleteMany({ user: user._id });

  // 11. Cascade delete AI logs
  const deletedAiLogs = await AiLog.deleteMany({ userId: user._id });

  // 12. Delete password resets and email verifications
  await PasswordReset.deleteMany({ userId: user._id });
  await EmailVerification.deleteMany({ userId: user._id });

  // 13. Audit log of self-service erasure
  try {
    await AuditLog.create({
      actorId: user._id,
      actorName: user.name,
      actorEmail: user.email,
      action: "USER_SELF_DELETE",
      targetType: "User",
      targetId: user._id,
      targetIdentifier: `${user.name} (${user.email})`,
      details: {
        reason: "Self-service GDPR Right to Erasure request",
        deletedGoalsCount: deletedGoals.deletedCount,
        deletedTasksCount: deletedTasks.deletedCount,
        deletedSubtasksCount: deletedSubtasks.deletedCount,
        deletedCommentsCount: deletedComments.deletedCount,
        deletedNotificationsCount: deletedNotifications.deletedCount,
        deletedWeeklyReportsCount: deletedWeeklyReports.deletedCount,
        deletedPomodorosCount: deletedPomodoros.deletedCount,
        deletedAiLogsCount: deletedAiLogs.deletedCount,
      },
    });
  } catch (auditErr) {
    console.error("Audit log error on self-deletion:", auditErr);
  }

  // 14. Delete the user document
  await User.deleteOne({ _id: user._id });

  // 15. Clear session cookie
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    message: "Your account and all associated personal data have been permanently erased.",
    cascaded: {
      goals: deletedGoals.deletedCount,
      tasks: deletedTasks.deletedCount,
      subtasks: deletedSubtasks.deletedCount,
      comments: deletedComments.deletedCount,
      notifications: deletedNotifications.deletedCount,
      weeklyReports: deletedWeeklyReports.deletedCount,
      pomodoros: deletedPomodoros.deletedCount,
      aiLogs: deletedAiLogs.deletedCount,
    },
  });
});

//@desc     Export user personal data package (GDPR Art. 20 Right to Data Portability)
//@route    GET /api/users/profile/export
//@access   Private
const exportSelfData = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).select("-password -twoFactorSecret -twoFactorBackupCodes");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Fetch all user data across collections
  const goals = await Goal.find({
    $or: [{ createdBy: userId }, { collaborators: userId }],
  }).lean();
  const goalIds = goals.map((g) => g._id);

  const tasks = await Task.find({
    $or: [{ createdBy: userId }, { goalId: { $in: goalIds } }],
  }).lean();
  const taskIds = tasks.map((t) => t._id);

  const subtasks = await Subtask.find({
    $or: [
      { createdBy: userId },
      { goalId: { $in: goalIds } },
      { taskId: { $in: taskIds } },
    ],
  }).lean();

  const comments = await Comment.find({
    $or: [{ authorId: userId }, { goalId: { $in: goalIds } }],
  }).lean();

  const weeklyReports = await WeeklyReport.find({ user: userId })
    .sort({ startDate: -1 })
    .lean();

  const pomodoroSessions = await PomodoroSession.find({ user: userId })
    .sort({ completedAt: -1 })
    .lean();

  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();

  const exportPayload = {
    exportVersion: "1.0",
    exportStandard: "GDPR Article 20 - Right to Data Portability",
    exportedAt: new Date().toISOString(),
    generator: "Stride Productivity Platform",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: Boolean(user.isAdmin),
      isEmailVerified: Boolean(user.isEmailVerified),
      isTwoFactorEnabled: Boolean(user.isTwoFactorEnabled),
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || 0,
      totalTasksCompleted: user.totalTasksCompleted || 0,
      totalGoalsCompleted: user.totalGoalsCompleted || 0,
      totalPomodorosCompleted: user.totalPomodorosCompleted || 0,
      achievements: user.achievements || [],
      lastActive: user.lastActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    statistics: {
      totalGoals: goals.length,
      totalTasks: tasks.length,
      totalSubtasks: subtasks.length,
      totalComments: comments.length,
      totalWeeklyReports: weeklyReports.length,
      totalPomodoroSessions: pomodoroSessions.length,
      totalNotifications: notifications.length,
    },
    data: {
      goals,
      tasks,
      subtasks,
      comments,
      weeklyReports,
      pomodoroSessions,
      notifications,
    },
  };

  const safeName = (user.name || "user").toLowerCase().replace(/[^a-z0-9]/g, "-");
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `stride-personal-data-${safeName}-${dateStr}.json`;

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "application/json");
  return res.status(200).send(JSON.stringify(exportPayload, null, 2));
});

//@desc     Get all users (paginated and searchable)
//@route    GET /api/users
//@access   Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const pageSize = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const search = req.query.search ? req.query.search.trim() : "";

  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const query = escapedSearch
    ? {
        $or: [
          { name: { $regex: escapedSearch, $options: "i" } },
          { email: { $regex: escapedSearch, $options: "i" } },
        ],
      }
    : {};

  const totalUsers = await User.countDocuments(query);
  const users = await User.find(query)
    .select("-password -twoFactorBackupCodes")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  // Map users to safe projection: do NOT expose twoFactorSecret itself, only boolean flag
  const safeUsers = users.map((user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    isAdmin: Boolean(user.isAdmin),
    isSuspended: Boolean(user.isSuspended),
    suspensionReason: user.suspensionReason || null,
    isTwoFactorEnabled: Boolean(user.isTwoFactorEnabled),
    hasTwoFactorSecret: Boolean(user.twoFactorSecret),
    xp: user.xp || 0,
    level: user.level || 1,
    streak: user.streak || 0,
    totalTasksCompleted: user.totalTasksCompleted || 0,
    totalGoalsCompleted: user.totalGoalsCompleted || 0,
    totalPomodorosCompleted: user.totalPomodorosCompleted || 0,
    lastActive: user.lastActive || user.updatedAt,
  }));

  res.json({
    users: safeUsers,
    page,
    pages: Math.ceil(totalUsers / pageSize) || 1,
    totalUsers,
  });
});

//@desc     Get user details by ID for admin
//@route    GET /api/users/:id
//@access   Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -twoFactorBackupCodes"
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const [goalsCount, tasksCount, subtasksCount] = await Promise.all([
    Goal.countDocuments({ createdBy: user._id }),
    Task.countDocuments({ createdBy: user._id }),
    Subtask.countDocuments({ createdBy: user._id }),
  ]);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    isAdmin: Boolean(user.isAdmin),
    isSuspended: Boolean(user.isSuspended),
    suspensionReason: user.suspensionReason || null,
    isTwoFactorEnabled: Boolean(user.isTwoFactorEnabled),
    hasTwoFactorSecret: Boolean(user.twoFactorSecret),
    xp: user.xp || 0,
    level: user.level || 1,
    streak: user.streak || 0,
    totalTasksCompleted: user.totalTasksCompleted || 0,
    totalGoalsCompleted: user.totalGoalsCompleted || 0,
    totalPomodorosCompleted: user.totalPomodorosCompleted || 0,
    achievements: user.achievements || [],
    lastActive: user.lastActive || user.updatedAt,
    goalsCount,
    tasksCount,
    subtasksCount,
  });
});

//@desc     Get system-wide metrics for admin dashboard
//@route    GET /api/users/admin/stats
//@access   Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [totalUsers, totalGoals, totalTasks, signupsThisWeek] = await Promise.all([
    User.countDocuments(),
    Goal.countDocuments(),
    Task.countDocuments(),
    User.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
  ]);

  res.json({
    totalUsers,
    totalGoals,
    totalTasks,
    signupsThisWeek,
  });
});

//@desc     Delete user account and cascade all associated data
//@route    DELETE /api/users/:id
//@access   Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Safeguard 1: Admin cannot delete themselves
  if (req.user && req.user._id && user._id.equals(req.user._id)) {
    res.status(400);
    throw new Error("You cannot delete your own account from the admin dashboard");
  }

  // Safeguard 2: Cannot delete the last active admin account
  if (user.isAdmin && (await User.countDocuments({ isAdmin: true })) <= 1) {
    res.status(400);
    throw new Error("Cannot delete the last admin account");
  }

  // Cascade cleanup across all associated collections:
  // 1. Find all goals created by this user
  const userGoals = await Goal.find({ createdBy: user._id }).select("_id");
  const userGoalIds = userGoals.map((g) => g._id);

  // 2. Find all tasks created by user OR linked to user's goals
  const userTasks = await Task.find({
    $or: [{ createdBy: user._id }, { goalId: { $in: userGoalIds } }],
  }).select("_id");
  const userTaskIds = userTasks.map((t) => t._id);

  // 3. Cascade delete subtasks (created by user, on user's tasks, or on user's goals)
  const deletedSubtasks = await Subtask.deleteMany({
    $or: [
      { createdBy: user._id },
      { goalId: { $in: userGoalIds } },
      { taskId: { $in: userTaskIds } },
    ],
  });

  // 4. Cascade delete tasks created by user or belonging to user's goals
  const deletedTasks = await Task.deleteMany({
    $or: [{ createdBy: user._id }, { goalId: { $in: userGoalIds } }],
  });

  // 5. Cascade delete comments authored by user OR on user's goals
  const deletedComments = await Comment.deleteMany({
    $or: [{ authorId: user._id }, { goalId: { $in: userGoalIds } }],
  });

  // 6. Cascade delete goals created by user
  const deletedGoals = await Goal.deleteMany({ createdBy: user._id });

  // 7. Prune deleted user from collaborators list on any goals they were part of
  await Goal.updateMany(
    { collaborators: user._id },
    { $pull: { collaborators: user._id } }
  );

  // 8. Cascade delete notifications for this user
  const deletedNotifications = await Notification.deleteMany({ user: user._id });

  // 9. Cascade delete weekly reports and pomodoro sessions
  const deletedWeeklyReports = await WeeklyReport.deleteMany({ user: user._id });
  const deletedPomodoros = await PomodoroSession.deleteMany({ user: user._id });

  // 10. Cascade delete AI telemetry logs
  const deletedAiLogs = await AiLog.deleteMany({ userId: user._id });

  // 11. Delete password reset tokens & email verification tokens for user
  await PasswordReset.deleteMany({ userId: user._id });
  await EmailVerification.deleteMany({ userId: user._id });

  // 12. Finally, delete the user document
  await User.deleteOne({ _id: user._id });

  // Log admin audit action
  await logAdminAction({
    req,
    action: "USER_DELETE",
    targetType: "User",
    targetId: user._id,
    targetIdentifier: `${user.name} (${user.email})`,
    details: {
      deletedGoalsCount: deletedGoals.deletedCount,
      deletedTasksCount: deletedTasks.deletedCount,
      deletedSubtasksCount: deletedSubtasks.deletedCount,
      deletedCommentsCount: deletedComments.deletedCount,
      deletedNotificationsCount: deletedNotifications.deletedCount,
      deletedWeeklyReportsCount: deletedWeeklyReports.deletedCount,
      deletedPomodorosCount: deletedPomodoros.deletedCount,
      deletedAiLogsCount: deletedAiLogs.deletedCount,
    },
  });

  res.json({
    message: "User and all associated data deleted successfully",
    cascaded: {
      goals: deletedGoals.deletedCount,
      tasks: deletedTasks.deletedCount,
      subtasks: deletedSubtasks.deletedCount,
      comments: deletedComments.deletedCount,
      notifications: deletedNotifications.deletedCount,
      weeklyReports: deletedWeeklyReports.deletedCount,
      pomodoros: deletedPomodoros.deletedCount,
      aiLogs: deletedAiLogs.deletedCount,
    },
  });
});

//@desc     Update user profile & administrative controls (promote, suspend, reset 2FA)
//@route    PUT /api/users/:id
//@access   Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isSelf = req.user && req.user._id && user._id.equals(req.user._id);
  const auditChanges = {};

  // Name update
  if (req.body.name && req.body.name.trim() !== user.name) {
    auditChanges.name = { from: user.name, to: req.body.name.trim() };
    user.name = req.body.name.trim();
  }

  // Admin promotion / demotion
  if (req.body.isAdmin !== undefined) {
    const targetAdminState = Boolean(req.body.isAdmin);
    if (user.isAdmin !== targetAdminState) {
      if (isSelf && !targetAdminState) {
        res.status(400);
        throw new Error("You cannot remove your own admin privileges");
      }
      if (user.isAdmin && !targetAdminState && (await User.countDocuments({ isAdmin: true })) <= 1) {
        res.status(400);
        throw new Error("Cannot demote the last remaining admin account");
      }
      auditChanges.isAdmin = { from: user.isAdmin, to: targetAdminState };
      user.isAdmin = targetAdminState;
    }
  }

  // Suspension / Activation
  if (req.body.isSuspended !== undefined) {
    const targetSuspendedState = Boolean(req.body.isSuspended);
    if (user.isSuspended !== targetSuspendedState) {
      if (isSelf && targetSuspendedState) {
        res.status(400);
        throw new Error("You cannot suspend your own account");
      }
      auditChanges.isSuspended = { from: user.isSuspended, to: targetSuspendedState };
      user.isSuspended = targetSuspendedState;
      user.suspensionReason = targetSuspendedState
        ? req.body.suspensionReason || "Suspended by administrator"
        : null;
      if (req.body.suspensionReason) {
        auditChanges.suspensionReason = req.body.suspensionReason;
      }
    }
  }

  // Force-reset / disable 2FA for locked-out user
  if (req.body.forceDisable2FA === true || req.body.isTwoFactorEnabled === false) {
    if (user.twoFactorSecret || user.isTwoFactorEnabled) {
      auditChanges.twoFactor = "Forced 2FA reset and disabled";
      user.isTwoFactorEnabled = false;
      user.twoFactorSecret = null;
      user.twoFactorBackupCodes = [];
    }
  }

  const updatedUser = await user.save();

  // Log admin action if changes were recorded
  if (Object.keys(auditChanges).length > 0) {
    await logAdminAction({
      req,
      action: auditChanges.isSuspended
        ? auditChanges.isSuspended.to
          ? "USER_SUSPEND"
          : "USER_UNSUSPEND"
        : auditChanges.isAdmin
        ? auditChanges.isAdmin.to
          ? "USER_PROMOTE"
          : "USER_DEMOTE"
        : auditChanges.twoFactor
        ? "USER_RESET_2FA"
        : "USER_UPDATE",
      targetType: "User",
      targetId: user._id,
      targetIdentifier: `${updatedUser.name} (${updatedUser.email})`,
      details: auditChanges,
    });
  }

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isAdmin: Boolean(updatedUser.isAdmin),
    isSuspended: Boolean(updatedUser.isSuspended),
    suspensionReason: updatedUser.suspensionReason,
    isTwoFactorEnabled: Boolean(updatedUser.isTwoFactorEnabled),
    hasTwoFactorSecret: Boolean(updatedUser.twoFactorSecret),
  });
});

//@desc     Get administrative audit logs
//@route    GET /api/users/admin/audit-logs
//@access   Private/Admin
const getAuditLogs = asyncHandler(async (req, res) => {
  const pageSize = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const page = Math.max(Number(req.query.page) || 1, 1);

  const totalLogs = await AuditLog.countDocuments();
  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    logs,
    page,
    pages: Math.ceil(totalLogs / pageSize) || 1,
    totalLogs,
  });
});

//@desc     Refresh User Token
//@route    PUT /api/users/refresh-token
//@access   Private
const refreshToken = async (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: "Not authorized!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Generate a new token
    const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_KEY, {
      expiresIn: "24h",
    });

    // Set new token in cookie
    res.cookie("jwt", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// @desc    Request password reset
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const genericMessage = "If that email exists, a reset link was sent";

  if (!email) {
    res.status(400);
    throw new Error("Please provide an email address");
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({ message: genericMessage });
  }

  // Never send password reset to an unconfirmed / unverified email
  if (!user.isEmailVerified) {
    return res.status(200).json({ message: genericMessage });
  }

  // Delete any existing reset tokens for this user
  await PasswordReset.deleteMany({ userId: user._id });

  // Generate new token
  const resetToken = PasswordReset.generateToken();

  // Save the reset token
  await PasswordReset.create({
    userId: user._id,
    token: resetToken,
  });

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // Create email content
  const html = `
    <!-- For forgot-password email -->
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px; background-color: #f9f9f9;">
  <div style="text-align: center; padding: 15px 0; margin-bottom: 20px;">
    <h1 style="color: #4a6cf7; margin: 0; font-size: 24px;">Password Reset Request</h1>
  </div>
  
  <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
    <p style="color: #333; font-size: 16px; margin-top: 0;">Hi ${user.name},</p>
    
    <p style="color: #555; font-size: 15px; line-height: 1.5;">You requested a password reset for your Stride account. Please click the button below to reset your password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #4a6cf7; color: white; font-weight: bold; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-size: 16px;">Reset Your Password</a>
    </div>
    
    <p style="color: #777; font-size: 14px; margin-bottom: 5px;">This link will expire in 1 hour.</p>
    <p style="color: #777; font-size: 14px;">If you didn't request this, please ignore this email.</p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 14px;">
      <p style="margin: 0;">Thanks,<br>The Stride Team</p>
    </div>
  </div>
  
  <div style="text-align: center; padding: 15px; color: #999; font-size: 12px; margin-top: 20px;">
    <p>&copy; 2024 Stride. All rights reserved.</p>
  </div>
</div>
  `;

  // Send email
  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Link (Valid for 1 hour)",
      html,
    });

    res.status(200).json({ message: genericMessage });
  } catch (error) {
    await PasswordReset.deleteMany({ userId: user._id });
    res.status(500);
    throw new Error("Email could not be sent");
  }
});

// @desc    Reset password
// @route   POST /api/users/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Find valid reset token
  const passwordReset = await PasswordReset.findOne({ token });

  if (!passwordReset) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  // Find user
  const user = await User.findById(passwordReset.userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update password
  user.password = password;
  await user.save();

  // Delete the reset token
  await PasswordReset.deleteMany({ userId: user._id });

  // Send confirmation email
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333333;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .email-header {
      background-color: #007AFF;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .email-logo {
      font-size: 28px;
      font-weight: bold;
      color: white;
    }
    .email-body {
      background-color: white;
      padding: 30px;
      border-radius: 0 0 8px 8px;
      border: 1px solid #e5e5e5;
      border-top: none;
    }
    .email-title {
      font-size: 24px;
      font-weight: 600;
      color: #007AFF;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .email-content {
      margin-bottom: 25px;
    }
    .alert-box {
      background-color: #fff8e1;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .email-footer {
      text-align: left;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      color: #666666;
      font-size: 14px;
    }
    .support-link {
      color: #007AFF;
      text-decoration: none;
      font-weight: 500;
    }
    .support-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="email-logo">Stride</div>
    </div>
    <div class="email-body">
      <h1 class="email-title">Password Reset Successful</h1>
      <div class="email-content">
        <p>Hi ${user.name},</p>
        <p>Your password for your Stride account has been successfully reset.</p>
        
        <div class="alert-box">
          <p><strong>Important:</strong> If you didn't make this change, please contact our support team immediately as your account may have been compromised.</p>
        </div>
        
        <p>You can now log in to your account with your new password. For security reasons, we recommend not sharing your password with anyone.</p>
      </div>
      
      <div class="email-footer">
        <p>Thanks,<br>The Stride Team</p>
        <p>Need help? Contact us at <a href="mailto:support@stride.com" class="support-link">support@stride.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

  await sendEmail({
    email: user.email,
    subject: "Your password has been reset",
    html,
  });

  res.status(200).json({ message: "Password reset successful" });
});

// Generate 2FA setup information for a user
const generateTwoFactorSecret = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Generate a secret
  const secret = speakeasy.generateSecret({
    name: `Stride:${user.email}`, // This will show in the Authenticator app
  });

  // Store the secret temporarily without activating 2FA yet
  user.twoFactorSecret = secret.base32;
  await user.save();

  // Generate QR code
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

  res.status(200).json({
    message: "2FA setup started",
    qrCodeUrl,
    secret: secret.base32, // For manual entry if needed
  });
});

// Verify and enable 2FA for a user
const verifyAndEnableTwoFactor = asyncHandler(async (req, res) => {
  const { token } = req.body;

  let userId = req.user?._id;
  if (!userId) {
    const setupToken =
      req.body.setupToken || req.headers.authorization?.split(" ")[1];
    if (setupToken) {
      try {
        const decoded = jwt.verify(setupToken, process.env.JWT_KEY);
        if (decoded.purpose === "2fa-setup") {
          userId = decoded.userId;
        }
      } catch (err) {
        res.status(401);
        throw new Error(
          "Invalid or expired 2FA setup session. Please log in again."
        );
      }
    }
  }

  if (!userId) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!user.twoFactorSecret) {
    res.status(400);
    throw new Error("2FA secret has not been generated for this account. Please restart setup.");
  }

  // Verify the token against the stored secret
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: token, // The token from the authenticator app
    window: 1, // Allow 1 step (±30s) clock drift
  });

  if (!verified) {
    res.status(400);
    throw new Error("Invalid verification code");
  }

  // Enable 2FA for the user - ONLY NOW!
  user.isTwoFactorEnabled = true;

  // Generate backup codes once, then hash those exact codes for storage.
  const plainBackupCodes = [];
  const hashedBackupCodes = [];
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(4).toString("hex");
    plainBackupCodes.push(code);
    hashedBackupCodes.push(await bcrypt.hash(code, 10));
  }

  user.twoFactorBackupCodes = hashedBackupCodes;
  user.lastActive = new Date();
  verifyUserStreakActive(user);
  await user.save();

  // NOW issue the session cookie and access token
  const accessToken = generateToken(res, user._id);

  res.status(200).json({
    message: "2FA enabled successfully",
    backupCodes: plainBackupCodes,
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    isTwoFactorEnabled: true,
    accessToken,
    xp: user.xp || 0,
    level: user.level || 1,
    streak: user.streak || 0,
    totalTasksCompleted: user.totalTasksCompleted || 0,
    totalGoalsCompleted: user.totalGoalsCompleted || 0,
    totalPomodorosCompleted: user.totalPomodorosCompleted || 0,
    achievements: user.achievements || [],
  });
});

// Disable 2FA for a user
const disableTwoFactor = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Re-verify password for security
  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    res.status(401);
    throw new Error("Invalid password");
  }

  // Disable 2FA
  user.isTwoFactorEnabled = false;
  user.twoFactorSecret = null;
  user.twoFactorBackupCodes = [];
  await user.save();

  res.status(200).json({ message: "2FA disabled successfully" });
});

// Validate 2FA during login
const validateTwoFactorAuth = asyncHandler(async (req, res) => {
  const { email, token, isBackupCode } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.isSuspended) {
    res.status(403);
    throw new Error(
      user.suspensionReason
        ? `Account suspended: ${user.suspensionReason}`
        : "Your account has been suspended. Please contact support."
    );
  }

  let validToken = false;

  if (isBackupCode) {
    // Validate backup code
    for (let i = 0; i < user.twoFactorBackupCodes.length; i++) {
      const isValid = await bcrypt.compare(token, user.twoFactorBackupCodes[i]);
      if (isValid) {
        // Remove used backup code
        user.twoFactorBackupCodes.splice(i, 1);
        await user.save();
        validToken = true;
        break;
      }
    }
  } else {
    // Validate TOTP token
    validToken = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 1, // Allow 1 time step (±30 seconds) for clock drift
    });
  }

  if (!validToken) {
    res.status(401);
    throw new Error("Invalid authentication code");
  }

  // Generate token and send response (similar to your regular login)
  const accessToken = generateToken(res, user._id);

  verifyUserStreakActive(user);
  await user.save();

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    isTwoFactorEnabled: user.isTwoFactorEnabled,
    accessToken,
    xp: user.xp || 0,
    level: user.level || 1,
    streak: user.streak || 0,
    totalTasksCompleted: user.totalTasksCompleted || 0,
    totalGoalsCompleted: user.totalGoalsCompleted || 0,
    totalPomodorosCompleted: user.totalPomodorosCompleted || 0,
    achievements: user.achievements || [],
  });
});

// @desc    Recover account / Reset password with backup code
// @route   POST /api/users/recover-with-backup-code
// @access  Public
const recoverWithBackupCode = asyncHandler(async (req, res) => {
  const { email, backupCode, newPassword } = req.body;

  if (!email || !backupCode || !newPassword) {
    res.status(400);
    throw new Error("Please provide email, backup code, and new password");
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if 2FA is enabled and user has backup codes
  if (!user.isTwoFactorEnabled || !user.twoFactorBackupCodes || user.twoFactorBackupCodes.length === 0) {
    res.status(400);
    throw new Error("2FA or backup codes not configured for this account");
  }

  // Verify backup code
  let validCode = false;
  let codeIndex = -1;

  for (let i = 0; i < user.twoFactorBackupCodes.length; i++) {
    const isValid = await bcrypt.compare(backupCode, user.twoFactorBackupCodes[i]);
    if (isValid) {
      validCode = true;
      codeIndex = i;
      break;
    }
  }

  if (!validCode) {
    res.status(401);
    throw new Error("Invalid backup code");
  }

  // Remove the used backup code
  user.twoFactorBackupCodes.splice(codeIndex, 1);
  
  // Set new password
  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: "Password reset successful. Please login with your new password." });
});

// @desc    Complete Pomodoro session
// @route   POST /api/users/pomodoro/complete
// @access  Private
const completePomodoro = asyncHandler(async (req, res) => {
  const durationMinutes = Number(req.body?.durationMinutes) || 25;
  const updatedUser = await handlePomodoroCompletionXP(req.user._id, durationMinutes);

  if (updatedUser) {
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
      xp: updatedUser.xp || 0,
      level: updatedUser.level || 1,
      streak: updatedUser.streak || 0,
      totalTasksCompleted: updatedUser.totalTasksCompleted || 0,
      totalGoalsCompleted: updatedUser.totalGoalsCompleted || 0,
      totalPomodorosCompleted: updatedUser.totalPomodorosCompleted || 0,
      achievements: updatedUser.achievements || [],
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Verify user email with token
// @route   POST /api/users/verify-email/:token (and GET)
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    res.status(400);
    throw new Error("Verification token is required");
  }

  const verificationRecord = await EmailVerification.findOne({ token });

  if (!verificationRecord) {
    res.status(400);
    throw new Error("Invalid or expired verification link. Please request a new one.");
  }

  const user = await User.findById(verificationRecord.userId);
  if (!user) {
    res.status(404);
    throw new Error("User account not found");
  }

  user.isEmailVerified = true;
  await user.save();

  // Clean up verification tokens for this user
  await EmailVerification.deleteMany({ userId: user._id });

  // Generate 2FA secret for direct onboarding flow
  let secretBase32 = user.twoFactorSecret;
  let otpauthUrl;
  if (!secretBase32) {
    const secret = speakeasy.generateSecret({
      name: `Stride:${user.email}`,
    });
    secretBase32 = secret.base32;
    user.twoFactorSecret = secretBase32;
    await user.save();
    otpauthUrl = secret.otpauth_url;
  } else {
    otpauthUrl = speakeasy.otpauthURL({
      secret: secretBase32,
      label: `Stride:${user.email}`,
      issuer: "Stride",
      encoding: "base32",
    });
  }

  const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);
  const setupToken = jwt.sign(
    { userId: user._id, purpose: "2fa-setup" },
    process.env.JWT_KEY,
    { expiresIn: "30m" }
  );

  res.status(200).json({
    message: "Email verified successfully! Complete two-factor authentication setup to activate your account.",
    email: user.email,
    isEmailVerified: true,
    requiresTwoFactorSetup: true,
    setupToken,
    twoFactorAuthSetup: {
      qrCodeUrl,
      otpauthUrl,
      secret: secretBase32,
    },
  });
});

// @desc    Resend email verification link
// @route   POST /api/users/resend-verification
// @access  Public
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please provide your email address");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(200).json({
      message: "If an unverified account exists for that email, a new verification link was sent.",
    });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      message: "This email address is already verified. Please log in directly.",
    });
  }

  // Delete previous tokens
  await EmailVerification.deleteMany({ userId: user._id });

  // Generate new token
  const token = EmailVerification.generateToken();
  await EmailVerification.create({
    userId: user._id,
    token,
  });

  try {
    await sendVerificationEmail(user, token);
  } catch (err) {
    console.error("Failed to resend verification email:", err);
    res.status(500);
    throw new Error("Failed to send verification email. Please try again later.");
  }

  res.status(200).json({
    message: "A new verification link has been sent to your email address.",
  });
});

export {
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
  deleteSelfAccount,
  exportSelfData,
  verifyEmail,
  resendVerificationEmail,
};

