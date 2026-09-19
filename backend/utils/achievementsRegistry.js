export const ACHIEVEMENTS_REGISTRY = {
  "first-step": {
    id: "first-step",
    title: "First Step",
    description: "Completed your first task or focus session",
    icon: "🌱",
    tier: "Bronze",
    xpBonus: 50,
  },
  "task-master": {
    id: "task-master",
    title: "Task Master",
    description: "Completed 10 tasks in total",
    icon: "⚡",
    tier: "Silver",
    xpBonus: 100,
  },
  "goal-getter": {
    id: "goal-getter",
    title: "Goal Getter",
    description: "Achieved your first goal",
    icon: "🏆",
    tier: "Gold",
    xpBonus: 150,
  },
  "focus-fanatic": {
    id: "focus-fanatic",
    title: "Focus Fanatic",
    description: "Completed 5 focus sessions",
    icon: "🧠",
    tier: "Silver",
    xpBonus: 100,
  },
  "streak-starter": {
    id: "streak-starter",
    title: "Streak Starter",
    description: "Maintained a 3-day activity streak",
    icon: "🔥",
    tier: "Bronze",
    xpBonus: 100,
  },
  "streak-legend": {
    id: "streak-legend",
    title: "Streak Legend",
    description: "Maintained a 10-day activity streak",
    icon: "👑",
    tier: "Platinum",
    xpBonus: 250,
  },
};

export const getHydratedAchievements = (achievementIds = []) => {
  if (!Array.isArray(achievementIds)) return [];
  return achievementIds.map((id) => {
    const found = ACHIEVEMENTS_REGISTRY[id];
    if (found) return { ...found, unlocked: true };
    return {
      id,
      title: id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      description: "Productivity achievement unlocked",
      icon: "🎖️",
      tier: "Special",
      xpBonus: 50,
      unlocked: true,
    };
  });
};
