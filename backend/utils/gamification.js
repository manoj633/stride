import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import logger from "./logger.js";

// Helper to update daily streak logic
export const updateUserStreak = (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!user.lastTaskCompletedDate) {
    user.streak = 1;
  } else {
    const lastCompleted = new Date(user.lastTaskCompletedDate);
    lastCompleted.setHours(0, 0, 0, 0);

    const diffInTime = today.getTime() - lastCompleted.getTime();
    const diffInDays = Math.round(diffInTime / (1000 * 3600 * 24));

    if (diffInDays === 1) {
      user.streak += 1;
    } else if (diffInDays > 1) {
      user.streak = 1; // reset streak to 1 because they did something today
    }
    // if diffInDays === 0, keep it the same
  }
  user.lastTaskCompletedDate = today;
};

// Helper to check if streak is broken (called on login/profile fetch)
export const verifyUserStreakActive = (user) => {
  if (user.lastTaskCompletedDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastCompleted = new Date(user.lastTaskCompletedDate);
    lastCompleted.setHours(0, 0, 0, 0);

    const diffInTime = today.getTime() - lastCompleted.getTime();
    const diffInDays = Math.round(diffInTime / (1000 * 3600 * 24));

    if (diffInDays > 1) {
      user.streak = 0; // Missed a day
    }
  }
};

// Helper to check and unlock achievements
export const checkAndAwardAchievements = async (user) => {
  const achievementsToAward = [];

  const unlockAchievement = async (badgeId, title, message) => {
    if (!user.achievements) {
      user.achievements = [];
    }
    if (!user.achievements.includes(badgeId)) {
      user.achievements.push(badgeId);
      achievementsToAward.push({ badgeId, title, message });

      // Create Notification
      await Notification.create({
        user: user._id,
        type: "other",
        title: `Achievement Unlocked! 🏆`,
        message: `Unlocked "${title}" badge! ${message}`,
      });
    }
  };

  // 1. First Step: Complete first task or Pomodoro
  if (
    (user.totalTasksCompleted || 0) +
    (user.totalPomodorosCompleted || 0) > 0 ||
    (user.xp || 0) > 0
  ) {
    await unlockAchievement(
      "first-step",
      "First Step",
      "Completed your first task or focus session. Awarded 50 XP bonus!"
    );
  }

  // 2. Task Master: 10 tasks completed
  if ((user.totalTasksCompleted || 0) >= 10) {
    await unlockAchievement(
      "task-master",
      "Task Master",
      "Completed 10 tasks in total. Awarded 100 XP bonus!"
    );
  }

  // 3. Goal Getter: First goal completed
  if ((user.totalGoalsCompleted || 0) >= 1) {
    await unlockAchievement(
      "goal-getter",
      "Goal Getter",
      "Achieved your first goal. Awarded 150 XP bonus!"
    );
  }

  // 4. Focus Fanatic: 5 Pomodoros completed
  if ((user.totalPomodorosCompleted || 0) >= 5) {
    await unlockAchievement(
      "focus-fanatic",
      "Focus Fanatic",
      "Completed 5 focus sessions. Awarded 100 XP bonus!"
    );
  }

  // 5. Streak Starter: 3-day streak
  if ((user.streak || 0) >= 3) {
    await unlockAchievement(
      "streak-starter",
      "Streak Starter",
      "Maintained a 3-day activity streak. Awarded 100 XP bonus!"
    );
  }

  // 6. Streak Legend: 10-day streak
  if ((user.streak || 0) >= 10) {
    await unlockAchievement(
      "streak-legend",
      "Streak Legend",
      "Maintained a 10-day activity streak. Awarded 250 XP bonus!"
    );
  }

  // Calculate bonus XP
  let bonusXP = 0;
  achievementsToAward.forEach((ach) => {
    if (ach.badgeId === "first-step") bonusXP += 50;
    if (ach.badgeId === "task-master") bonusXP += 100;
    if (ach.badgeId === "goal-getter") bonusXP += 150;
    if (ach.badgeId === "focus-fanatic") bonusXP += 100;
    if (ach.badgeId === "streak-starter") bonusXP += 100;
    if (ach.badgeId === "streak-legend") bonusXP += 250;
  });

  if (bonusXP > 0) {
    user.xp = (user.xp || 0) + bonusXP;
  }
};

// Award subtask completion XP
export const handleSubtaskCompletionXP = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.xp = (user.xp || 0) + 10;
    updateUserStreak(user);
    await checkAndAwardAchievements(user);

    // Level up check
    const calculatedLevel = Math.floor(user.xp / 100) + 1;
    if (calculatedLevel > (user.level || 1)) {
      user.level = calculatedLevel;
      await Notification.create({
        user: user._id,
        type: "other",
        title: `Level Up! 🌟`,
        message: `Congratulations! You've reached Level ${user.level}! Keep crushing your goals.`,
      });
    }

    await user.save();
    logger.info(`Subtask completion XP awarded to user ${user.name}`);
  } catch (error) {
    logger.error(`Error in handleSubtaskCompletionXP: ${error.message}`);
  }
};

// Award task completion XP
export const handleTaskCompletionXP = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.totalTasksCompleted = (user.totalTasksCompleted || 0) + 1;
    user.xp = (user.xp || 0) + 30;
    updateUserStreak(user);
    await checkAndAwardAchievements(user);

    // Level up check
    const calculatedLevel = Math.floor(user.xp / 100) + 1;
    if (calculatedLevel > (user.level || 1)) {
      user.level = calculatedLevel;
      await Notification.create({
        user: user._id,
        type: "other",
        title: `Level Up! 🌟`,
        message: `Congratulations! You've reached Level ${user.level}! Keep crushing your goals.`,
      });
    }

    await user.save();
    logger.info(`Task completion XP awarded to user ${user.name}`);
  } catch (error) {
    logger.error(`Error in handleTaskCompletionXP: ${error.message}`);
  }
};

// Award goal completion XP
export const handleGoalCompletionXP = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.totalGoalsCompleted = (user.totalGoalsCompleted || 0) + 1;
    user.xp = (user.xp || 0) + 100;
    await checkAndAwardAchievements(user);

    // Level up check
    const calculatedLevel = Math.floor(user.xp / 100) + 1;
    if (calculatedLevel > (user.level || 1)) {
      user.level = calculatedLevel;
      await Notification.create({
        user: user._id,
        type: "other",
        title: `Level Up! 🌟`,
        message: `Congratulations! You've reached Level ${user.level}! Keep crushing your goals.`,
      });
    }

    await user.save();
    logger.info(`Goal completion XP awarded to user ${user.name}`);
  } catch (error) {
    logger.error(`Error in handleGoalCompletionXP: ${error.message}`);
  }
};

// Award Pomodoro completion XP
export const handlePomodoroCompletionXP = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    user.totalPomodorosCompleted = (user.totalPomodorosCompleted || 0) + 1;
    user.xp = (user.xp || 0) + 15; // 15 XP for focusing!
    updateUserStreak(user);
    await checkAndAwardAchievements(user);

    // Level up check
    const calculatedLevel = Math.floor(user.xp / 100) + 1;
    if (calculatedLevel > (user.level || 1)) {
      user.level = calculatedLevel;
      await Notification.create({
        user: user._id,
        type: "other",
        title: `Level Up! 🌟`,
        message: `Congratulations! You've reached Level ${user.level}! Keep crushing your goals.`,
      });
    }

    await user.save();
    logger.info(`Pomodoro completion XP awarded to user ${user.name}`);
    return user;
  } catch (error) {
    logger.error(`Error in handlePomodoroCompletionXP: ${error.message}`);
    return null;
  }
};
