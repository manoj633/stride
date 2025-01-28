// utils/tagUtils.js
export const generatePastelColor = () => {
  const r = Math.floor(Math.random() * 55 + 200).toString(16); // 200-255
  const g = Math.floor(Math.random() * 55 + 200).toString(16); // 200-255
  const b = Math.floor(Math.random() * 55 + 200).toString(16); // 200-255

  const rr = r.length === 1 ? "0" + r : r;
  const gg = g.length === 1 ? "0" + g : g;
  const bb = b.length === 1 ? "0" + b : b;

  return `#${rr}${gg}${bb}`;
};

export const generateTagIcon = (name) => {
  const icons = {
    important: "⭐",
    urgent: "🔥",
    work: "💼",
    personal: "👤",
    home: "🏠",
    study: "📚",
    health: "❤️",
    finance: "💰",
    today: "📅",
    "this week": "📆",
    "this month": "📊",
    someday: "🔮",
    recurring: "🔄",
  };
  return icons[name.toLowerCase()] || "🏷️";
};

export const tagPresets = [
  { name: "Important", color: "#ffb3ba" },
  { name: "Work", color: "#baffc9" },
  { name: "Personal", color: "#bae1ff" },
  { name: "Urgent", color: "#ffffba" },
];

export const tagCategories = {
  "Task Status": [
    { name: "To Do", color: "#ff9aa2" },
    { name: "In Progress", color: "#ffdac1" },
    { name: "Done", color: "#c7ceea" },
  ],
  Priority: [
    { name: "Important", color: "#ff6b6b" },
    { name: "Urgent", color: "#ffd93d" },
    { name: "Low Priority", color: "#95e1d3" },
  ],
  Areas: [
    { name: "Work", color: "#a8e6cf" },
    { name: "Personal", color: "#dcedc1" },
    { name: "Study", color: "#ffd3b6" },
    { name: "Health", color: "#ffaaa5" },
  ],
  "Time Frame": [
    { name: "Today", color: "#ff8585" },
    { name: "This Week", color: "#82c1ff" },
    { name: "This Month", color: "#87e6b5" },
    { name: "Someday", color: "#b5b5ff" },
    { name: "Recurring", color: "#ffc385" },
  ],
};
