import AuditLog from "../models/auditLogModel.js";
import logger from "./logger.js";

/**
 * Helper to record administrative actions into AuditLog collection.
 * Non-blocking: logs any DB persistence errors rather than failing the calling request.
 *
 * @param {Object} params
 * @param {Object} params.req - Express request object containing req.user
 * @param {string} params.action - e.g. 'USER_SUSPEND', 'USER_PROMOTE', 'COMMENT_DELETE'
 * @param {string} params.targetType - 'User' | 'Comment' | 'Goal' | 'Task' | 'System'
 * @param {string|mongoose.Types.ObjectId} [params.targetId] - ID of modified entity
 * @param {string} [params.targetIdentifier] - Human readable identifier (email, excerpt, title)
 * @param {Object} [params.details] - Additional contextual diffs or reasons
 */
export const logAdminAction = async ({
  req,
  action,
  targetType,
  targetId = null,
  targetIdentifier = null,
  details = {},
}) => {
  try {
    const actorId = req.user?._id || req.userId;
    const actorName = req.user?.name || "Admin";
    const actorEmail = req.user?.email || "admin@stride.com";

    if (!actorId) {
      logger.warn("Audit log attempted without authenticated user", { action });
      return;
    }

    await AuditLog.create({
      actorId,
      actorName,
      actorEmail,
      action,
      targetType,
      targetId,
      targetIdentifier,
      details,
    });

    logger.info("Admin action audited", {
      action,
      actorEmail,
      targetType,
      targetId,
    });
  } catch (error) {
    logger.error("Failed to write audit log", {
      error: error.message,
      action,
      targetType,
    });
  }
};

export default logAdminAction;
