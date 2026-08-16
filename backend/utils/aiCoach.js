import { GoogleGenAI } from "@google/genai";

export const getAICoachPrediction = async (goalTitle, goalDescription, completedTasks, totalTasks, daysRemaining, daysNeeded, status) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return getSimulatedCoachAssessment(goalTitle, completedTasks, totalTasks, daysRemaining, daysNeeded, status);
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are Stride's expert AI productivity coach. Analyze the progression statistics of a user's goal:
Goal Title: "${goalTitle}"
Goal Description: "${goalDescription || 'No description provided'}"
Progression: Completed ${completedTasks} out of ${totalTasks} tasks.
Target end date status: ${daysRemaining} days remaining.
Predicted time needed to complete remaining tasks: ${Math.ceil(daysNeeded)} days.
Calculated Project Status: ${status}

Write a short, engaging, and personalized coaching assessment (maximum 3 sentences). 
- If the status is "completed", congratulate them warmly.
- If the status is "on-track", encourage them and give a quick tip on maintaining their speed.
- If the status is "at-risk" or "overdue", be encouraging yet direct, and suggest an actionable tip (e.g. using Pomodoro focus blocks or breaking down remaining tasks) to speed up completion.
Do not use markdown formatting in your response. Keep the tone friendly, concise, and professional.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    if (response && response.text) {
      return response.text.trim();
    }
    return getSimulatedCoachAssessment(goalTitle, completedTasks, totalTasks, daysRemaining, daysNeeded, status);
  } catch (err) {
    console.error("Gemini API error:", err?.message || err?.status || err);
    return getSimulatedCoachAssessment(goalTitle, completedTasks, totalTasks, daysRemaining, daysNeeded, status);
  }
};

const getSimulatedCoachAssessment = (goalTitle, completedTasks, totalTasks, daysRemaining, daysNeeded, status) => {
  const remaining = totalTasks - completedTasks;
  if (status === "completed") {
    return `Fantastic job! You have fully completed all tasks for "${goalTitle}". Take a moment to celebrate this achievement and reflect on your success!`;
  }
  if (status === "overdue") {
    return `The target date for "${goalTitle}" has passed, but you still have ${remaining} task${remaining === 1 ? '' : 's'} remaining. Try time-blocking 15 minutes today to complete the next small step.`;
  }
  if (status === "on-track") {
    return `Great work! At your current pace, you are on track to complete "${goalTitle}" with time to spare. Consider dedicating a Pomodoro block today to locking in this momentum.`;
  }
  if (status === "at-risk") {
    return `You are currently at risk of missing your target date for "${goalTitle}". Based on your velocity, you will need about ${Math.ceil(daysNeeded)} days to finish the remaining ${remaining} tasks. Try breaking these tasks into smaller subtasks to increase velocity.`;
  }
  return `Keep taking consistent action toward "${goalTitle}". Every task completed brings you closer to your milestone.`;
};
