// src/services/dataService.js

// Goals, Tasks, Subtasks, Comments, Collaborators, and Tags data arrays
// Sample goals array

// Full goals array structure with all fields

var goals = [
  {
    id: "1",
    title: "Learn React",
    description: "Complete React course and build projects.",
    category: "Education",
    priority: "High",
    duration: {
      startDate: "2023-10-01",
      endDate: "2023-12-31",
    },
    completed: false,
    completionPercentage: 0,
    collaborators: ["2", "3"],
    tags: ["1", "7"], // Learning, Career
    comments: [],
  },
  {
    id: "2",
    title: "Fitness Goals",
    description: "Lose 10 kg and maintain a healthy diet.",
    category: "Health",
    priority: "Medium",
    duration: {
      startDate: "2024-01-01",
      endDate: "2024-06-30",
    },
    completed: false,
    completionPercentage: 0,
    collaborators: ["4"],
    tags: ["3", "4"], // Health, Fitness
    comments: [],
  },
  {
    id: "3",
    title: "Travel to Japan",
    description: "Visit Tokyo and Kyoto with family.",
    category: "Leisure",
    priority: "High",
    duration: {
      startDate: "2025-03-01",
      endDate: "2025-05-15",
    },
    completed: false,
    completionPercentage: 0,
    collaborators: ["1"],
    tags: ["5", "6"], // Travel, Personal Development
    comments: [],
  },
  {
    id: "4",
    title: "Complete a Marathon",
    description: "Train and participate in a marathon event.",
    category: "Fitness",
    priority: "High",
    duration: {
      startDate: "2024-04-01",
      endDate: "2024-11-10",
    },
    completed: false,
    completionPercentage: 0,
    collaborators: ["2", "5"],
    tags: ["4", "3"], // Fitness, Health
    comments: [],
  },
  {
    id: "5",
    title: "Learn Spanish",
    description: "Complete Spanish language course by 2026.",
    category: "Education",
    priority: "Medium",
    duration: {
      startDate: "2024-01-01",
      endDate: "2026-12-31",
    },
    completed: false,
    completionPercentage: 0,
    collaborators: ["3"],
    tags: ["2", "1"], // Education, Learning
    comments: [],
  },
  {
    id: "6",
    title: "Start a Blog",
    description: "Create a personal blog and post regularly.",
    category: "Career",
    priority: "Low",
    duration: {
      startDate: "2023-01-01",
      endDate: "2023-10-31",
    },
    completed: false,
    completionPercentage: 0,
    collaborators: ["1", "4"],
    tags: ["7", "8"], // Career, Writing
    comments: [],
  },
  {
    id: "7",
    title: "Complete a Data Science Course",
    description: "Learn data analysis and visualization techniques.",
    category: "Education",
    priority: "High",
    duration: {
      startDate: "2024-02-01",
      endDate: "2024-08-31",
    },
    completed: false,
    completionPercentage: 0,
    collaborators: ["4"],
    tags: ["1", "10"], // Learning, Programming
    comments: [],
  },
  {
    id: "8",
    title: "Improve Public Speaking Skills",
    description: "Join a local Toastmasters club and practice weekly.",
    category: "Education",
    priority: "Medium",
    duration: {
      startDate: "2024-01-01",
      endDate: "2024-05-15",
    },
    completed: false,
    completionPercentage: 0,
    collaborators: ["1", "5"],
    tags: ["1", "9"], // Learning, Public Speaking
    comments: [],
  },
  {
    id: "9",
    title: "Master Python Programming",
    description: "Complete online Python courses and build a portfolio.",
    category: "Education",
    priority: "High",
    duration: {
      startDate: "2024-03-01",
      endDate: "2025-01-15",
    },
    completed: false,
    completionPercentage: 0,
    collaborators: ["2"],
    tags: ["1", "10"], // Learning, Programming
    comments: [],
  },
  {
    id: "10",
    title: "Study for Certification in Cloud Computing",
    description: "Prepare for the AWS Certified Solutions Architect exam.",
    category: "Education",
    priority: "High",
    duration: {
      startDate: "2024-06-01",
      endDate: "2024-12-31",
    },
    completed: false,
    completionPercentage: 0,
    collaborators: ["3"],
    tags: ["1", "7"], // Learning, Career
    comments: [],
  },
  {
    id: "11",
    title: "Attend a Workshop on UX Design",
    description:
      "Enhance design skills by participating in practical workshops.",
    category: "Education",
    priority: "Medium",
    duration: {
      startDate: "2024-05-01",
      endDate: "2024-07-20",
    },
    completed: false,
    completionPercentage: 0,
    collaborators: ["1", "4"],
    tags: ["1", "7"], // Learning, Career
    comments: [],
  },
  {
    id: "12",
    title: "Read 12 Books This Year",
    description: "One book per month for personal development.",
    category: "Education",
    priority: "Low",
    duration: {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
    completed: false,
    completionPercentage: 0,
    collaborators: [],
    tags: ["1", "6"], // Learning, Personal Development
    comments: [],
  },
];

var tasks = [
  // Tasks for Goal ID 1 (Learn React)
  {
    id: "1",
    name: "Complete React Module",
    description: "Finish the React basics module.",
    priority: "High",
    startDate: "2024-12-01",
    endDate: "2024-12-06",
    completed: false,
    goalId: "1",
    completionPercentage: 0,
  },
  {
    id: "2",
    name: "Build a Simple React App",
    description: "Create a basic To-Do list app using React.",
    priority: "Medium",
    startDate: "2023-11-01",
    endDate: "2024-12-15",
    completed: false,
    goalId: "1",
    completionPercentage: 0,
  },
  {
    id: "3",
    name: "Practice React Hooks",
    description: "Complete exercises on React hooks and their applications.",
    priority: "Medium",
    startDate: "2023-11-15",
    endDate: "2024-12-20",
    completed: false,
    goalId: "1",
    completionPercentage: 0,
  },

  // Tasks for Goal ID 5 (Learn Spanish)
  {
    id: "4",
    name: "Enroll in Spanish Course",
    description: "Sign up for an online Spanish language course.",
    priority: "High",
    startDate: "2023-12-01",
    endDate: "2024-01-15",
    completed: false,
    goalId: "5",
    completionPercentage: 0,
  },
  {
    id: "5",
    name: "Complete Spanish Vocabulary Module",
    description: "Finish the first vocabulary module in the Spanish course.",
    priority: "Medium",
    startDate: "2024-01-20",
    endDate: "2024-02-28",
    completed: false,
    goalId: "5",
    completionPercentage: 0,
  },

  // Tasks for Goal ID 7 (Complete a Data Science Course)
  {
    id: "6",
    name: "Complete Data Analysis Project",
    description: "Work on a project involving data cleaning and analysis.",
    priority: "High",
    startDate: "2024-05-01",
    endDate: "2024-09-15",
    completed: false,
    goalId: "7",
    completionPercentage: 0,
  },
  {
    id: "7",
    name: "Attend Data Science Webinar",
    description: "Join a webinar on the latest trends in data science.",
    priority: "Medium",
    startDate: "2024-07-01",
    endDate: "2024-08-01",
    completed: false,
    goalId: "7",
    completionPercentage: 0,
  },

  // Tasks for Goal ID 8 (Improve Public Speaking Skills)
  {
    id: "8",
    name: "Practice Public Speaking",
    description: "Prepare a 5-minute speech for Toastmasters.",
    priority: "High",
    startDate: "2024-03-01",
    endDate: "2024-04-15",
    completed: false,
    goalId: "8",
    completionPercentage: 0,
  },

  // Tasks for Goal ID 9 (Master Python Programming)
  {
    id: "9",
    name: "Complete Python Basics Course",
    description: "Finish the introductory Python course online.",
    priority: "High",
    startDate: "2024-10-01",
    endDate: "2024-11-30",
    completed: false,
    goalId: "9",
    completionPercentage: 0,
  },
  {
    id: "10",
    name: "Build a Portfolio Project in Python",
    description: "Develop a project to showcase Python skills.",
    priority: "Medium",
    startDate: "2024-12-01",
    endDate: "2025-01-10",
    completed: false,
    goalId: "9",
    completionPercentage: 0,
  },

  // Tasks for Goal ID 10 (Study for Certification in Cloud Computing)
  {
    id: "11",
    name: "Study AWS Solutions Architect Guide",
    description:
      "Read and summarize the AWS Certified Solutions Architect study guide.",
    priority: "High",
    startDate: "2024-12-01",
    endDate: "2024-12-01",
    completed: false,
    goalId: "10",
    completionPercentage: 0,
  },
  {
    id: "12",
    name: "Take Practice AWS Exam",
    description:
      "Complete a practice exam for AWS Certified Solutions Architect.",
    priority: "Medium",
    startDate: "2024-12-20",
    endDate: "2024-12-15",
    completed: false,
    goalId: "10",
    completionPercentage: 0,
  },

  // Tasks for Goal ID 11 (Attend a Workshop on UX Design)
  {
    id: "13",
    name: "Attend UX Design Workshop",
    description: "Participate in a hands-on UX design workshop.",
    priority: "Medium",
    startDate: "2024-06-01",
    endDate: "2024-06-15",
    completed: false,
    goalId: "11",
    completionPercentage: 0,
  },
  {
    id: "14",
    name: "Read 'Designing for the User Experience'",
    description: "Finish reading a recommended book on UX design principles.",
    priority: "Low",
    startDate: "2024-06-20",
    endDate: "2024-07-01",
    completed: false,
    goalId: "11",
    completionPercentage: 0,
  },

  // Tasks for Goal ID 12 (Read 12 Books This Year)
  {
    id: "15",
    name: "Track Reading Progress",
    description: "Maintain a list of books read throughout the year.",
    priority: "Low",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    completed: false,
    goalId: "12",
    completionPercentage: 0,
  },
];

var subtasks = [
  // Subtasks for Task ID 1 (Complete React Module)
  {
    id: "1",
    name: "Read documentation",
    description: "Read React documentation for understanding components.",
    priority: "Medium",
    dueDate: "2023-11-01",
    completed: false,
    taskId: "1",
    goalId: "1",
  },
  {
    id: "2",
    name: "Complete tutorial exercises",
    description: "Finish all exercises in the React tutorial.",
    priority: "High",
    dueDate: "2023-11-10",
    completed: false,
    taskId: "1",
    goalId: "1",
  },

  // Subtasks for Task ID 2 (Build a Simple React App)
  {
    id: "3",
    name: "Create project structure",
    description: "Set up the folder structure for the To-Do list app.",
    priority: "Medium",
    dueDate: "2024-12-01",
    completed: false,
    taskId: "2",
    goalId: "1",
  },
  {
    id: "4",
    name: "Implement component logic",
    description: "Code the main components for the To-Do list app.",
    priority: "High",
    dueDate: "2024-12-10",
    completed: false,
    taskId: "2",
    goalId: "1",
  },

  // Subtasks for Task ID 4 (Enroll in Spanish Course)
  {
    id: "5",
    name: "Research online courses",
    description: "Find and compare different Spanish language courses.",
    priority: "High",
    dueDate: "2024-01-10",
    completed: false,
    taskId: "4",
    goalId: "5",
  },
  {
    id: "6",
    name: "Register for selected course",
    description: "Sign up for the chosen online Spanish language course.",
    priority: "High",
    dueDate: "2024-01-15",
    completed: false,
    taskId: "4",
    goalId: "5",
  },

  // Subtasks for Task ID 5 (Complete Spanish Vocabulary Module)
  {
    id: "7",
    name: "Study vocabulary list",
    description: "Learn the vocabulary from the module.",
    priority: "Medium",
    dueDate: "2024-02-10",
    completed: false,
    taskId: "5",
    goalId: "5",
  },
  {
    id: "8",
    name: "Complete vocabulary quizzes",
    description: "Finish quizzes to test vocabulary knowledge.",
    priority: "Medium",
    dueDate: "2024-02-20",
    completed: false,
    taskId: "5",
    goalId: "5",
  },

  // Subtasks for Task ID 9 (Complete Python Basics Course)
  {
    id: "9",
    name: "Watch introductory videos",
    description: "View all introductory Python videos in the course.",
    priority: "High",
    dueDate: "2024-11-15",
    completed: false,
    taskId: "9",
    goalId: "9",
  },
  {
    id: "10",
    name: "Complete coding exercises",
    description: "Finish all coding exercises provided in the course.",
    priority: "High",
    dueDate: "2024-11-25",
    completed: false,
    taskId: "9",
    goalId: "9",
  },

  // Subtasks for Task ID 11 (Study AWS Solutions Architect Guide)
  {
    id: "11",
    name: "Outline key concepts",
    description: "Create an outline of the key concepts from the study guide.",
    priority: "Medium",
    dueDate: "2024-10-15",
    completed: false,
    taskId: "11",
    goalId: "10",
  },
  {
    id: "12",
    name: "Review practice questions",
    description: "Go through all the practice questions in the guide.",
    priority: "High",
    dueDate: "2024-11-01",
    completed: false,
    taskId: "11",
    goalId: "10",
  },

  // Subtasks for Task ID 13 (Attend UX Design Workshop)
  {
    id: "13",
    name: "Prepare workshop materials",
    description: "Gather all materials needed for the workshop.",
    priority: "Medium",
    dueDate: "2024-06-10",
    completed: false,
    taskId: "13",
    goalId: "11",
  },
  {
    id: "14",
    name: "Participate in group activities",
    description: "Engage in all group activities during the workshop.",
    priority: "High",
    dueDate: "2024-06-15",
    completed: false,
    taskId: "13",
    goalId: "11",
  },

  // Subtasks for Task ID 15 (Track Reading Progress)
  {
    id: "15",
    name: "Create a reading log",
    description: "Set up a document to log all books read this year.",
    priority: "Low",
    dueDate: "2024-01-01",
    completed: false,
    taskId: "15",
    goalId: "12",
  },
  {
    id: "16",
    name: "Review and update log monthly",
    description: "Ensure the reading log is updated at the end of each month.",
    priority: "Low",
    dueDate: "2024-12-31",
    completed: false,
    taskId: "15",
    goalId: "12",
  },
];

var comments = [
  // Comments for Goal ID 1 (Learn React)
  {
    id: "1",
    goalId: "1",
    text: "Making good progress on React fundamentals.",
    date: "2023-10-15T10:30:00Z",
    authorId: "1", // John Doe
  },
  {
    id: "2",
    goalId: "1",
    text: "Struggling a bit with component lifecycle methods.",
    date: "2023-10-20T12:15:00Z",
    authorId: "2", // Alice Smith
  },
  {
    id: "3",
    goalId: "1",
    text: "Just finished the React module! Excited to build my first app.",
    date: "2023-10-25T14:45:00Z",
    authorId: "3", // Bob Johnson
  },

  // Comments for Goal ID 5 (Learn Spanish)
  {
    id: "4",
    goalId: "5",
    text: "Enrolled in a new Spanish course today!",
    date: "2024-01-10T09:00:00Z",
    authorId: "4", // Sara Williams
  },
  {
    id: "5",
    goalId: "5",
    text: "Really enjoying the vocabulary exercises.",
    date: "2024-02-05T11:20:00Z",
    authorId: "5", // Michael Brown
  },

  // Comments for Goal ID 7 (Complete a Data Science Course)
  {
    id: "6",
    goalId: "7",
    text: "Started the data analysis project. It's challenging but fun!",
    date: "2024-09-01T08:30:00Z",
    authorId: "1", // John Doe
  },
  {
    id: "7",
    goalId: "7",
    text: "Attended a webinar last week, learned a lot about AI.",
    date: "2024-08-05T15:10:00Z",
    authorId: "6", // Emma Davis
  },

  // Comments for Goal ID 8 (Improve Public Speaking Skills)
  {
    id: "8",
    goalId: "8",
    text: "Practiced my speech in front of friends, it went well!",
    date: "2024-04-10T17:00:00Z",
    authorId: "7", // James Wilson
  },

  // Comments for Goal ID 9 (Master Python Programming)
  {
    id: "9",
    goalId: "9",
    text: "Finished the first few sections of the Python course.",
    date: "2024-11-05T13:00:00Z",
    authorId: "2", // Alice Smith
  },
  {
    id: "10",
    goalId: "9",
    text: "Started working on my portfolio project, feeling motivated!",
    date: "2024-12-01T19:00:00Z",
    authorId: "4", // Sara Williams
  },

  // Comments for Goal ID 10 (Study for Certification in Cloud Computing)
  {
    id: "11",
    goalId: "10",
    text: "The AWS study guide is very comprehensive.",
    date: "2024-10-05T10:00:00Z",
    authorId: "5", // Michael Brown
  },
  {
    id: "12",
    goalId: "10",
    text: "Completed a practice exam and scored well!",
    date: "2024-11-01T14:30:00Z",
    authorId: "3", // Bob Johnson
  },

  // Comments for Goal ID 11 (Attend a Workshop on UX Design)
  {
    id: "13",
    goalId: "11",
    text: "Looking forward to the workshop next month!",
    date: "2024-05-20T16:45:00Z",
    authorId: "6", // Emma Davis
  },

  // Comments for Goal ID 12 (Read 12 Books This Year)
  {
    id: "14",
    goalId: "12",
    text: "I've finished 5 books so far this year!",
    date: "2024-03-30T11:15:00Z",
    authorId: "7", // James Wilson
  },
  {
    id: "15",
    goalId: "12",
    text: "Need to pick up the pace if I want to reach my goal.",
    date: "2024-06-15T12:00:00Z",
    authorId: "1", // John Doe
  },
];

var collaborators = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://example.com/avatars/john.jpg",
  },
  {
    id: "2",
    name: "Alice Smith",
    email: "alice@example.com",
    avatar: "https://example.com/avatars/alice.jpg",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    avatar: "https://example.com/avatars/bob.jpg",
  },
  {
    id: "4",
    name: "Sara Williams",
    email: "sara@example.com",
    avatar: "https://example.com/avatars/sara.jpg",
  },
  {
    id: "5",
    name: "Michael Brown",
    email: "michael@example.com",
    avatar: "https://example.com/avatars/michael.jpg",
  },
  {
    id: "6",
    name: "Emma Davis",
    email: "emma@example.com",
    avatar: "https://example.com/avatars/emma.jpg",
  },
  {
    id: "7",
    name: "James Wilson",
    email: "james@example.com",
    avatar: "https://example.com/avatars/james.jpg",
  },
];

var tags = [
  {
    id: "1",
    name: "Learning",
    color: "#ffb3ba", // Pastel Pink
  },
  {
    id: "2",
    name: "Education",
    color: "#ffdfba", // Pastel Orange
  },
  {
    id: "3",
    name: "Health",
    color: "#ffffba", // Pastel Yellow
  },
  {
    id: "4",
    name: "Fitness",
    color: "#baffc9", // Pastel Green
  },
  {
    id: "5",
    name: "Travel",
    color: "#bae1ff", // Pastel Blue
  },
  {
    id: "6",
    name: "Personal Development",
    color: "#cbaacb", // Pastel Purple
  },
  {
    id: "7",
    name: "Career",
    color: "#ffe5e5", // Light Pastel Red
  },
  {
    id: "8",
    name: "Writing",
    color: "#d5b8ff", // Light Lavender
  },
  {
    id: "9",
    name: "Public Speaking",
    color: "#d2f4d2", // Light Pastel Green
  },
  {
    id: "10",
    name: "Programming",
    color: "#e3d4ff", // Light Pastel Lavender
  },
];

// Data Providers
export const goalsProvider = () => goals;
export const tasksProvider = () => tasks;
export const subtasksProvider = () => subtasks;
export const commentsProvider = () => comments;
export const collaboratorsProvider = () => collaborators;
export const tagsProvider = () => tags;

// Update Functions
export const updateSubtaskCompletionStatus = (subtaskId, completed) => {
  const subtaskIndex = subtasks.findIndex((st) => st.id === subtaskId);
  if (subtaskIndex !== -1) {
    subtasks[subtaskIndex].completed = completed;
    const { taskId, goalId } = subtasks[subtaskIndex];
    updateTaskCompletionPercentage(taskId);
    updateGoalCompletionPercentage(goalId);
  }
};

const updateTaskCompletionPercentage = (taskId) => {
  const taskSubtasks = subtasks.filter((st) => st.taskId === taskId);
  const completedCount = taskSubtasks.filter((st) => st.completed).length;
  const completionPercentage = (completedCount / taskSubtasks.length) * 100;
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex !== -1) {
    tasks[taskIndex].completionPercentage = completionPercentage;
    tasks[taskIndex].completed = completionPercentage === 100;
  }
};

const updateGoalCompletionPercentage = (goalId) => {
  const relatedTasks = tasks.filter((t) => t.goalId === goalId);
  const allRelatedSubtasks = relatedTasks.flatMap((task) =>
    subtasks.filter((st) => st.taskId === task.id)
  );
  const completedCount = allRelatedSubtasks.filter((st) => st.completed).length;
  const completionPercentage = allRelatedSubtasks.length
    ? (completedCount / allRelatedSubtasks.length) * 100
    : 0;

  const goalIndex = goals.findIndex((g) => g.id === goalId);
  if (goalIndex !== -1) {
    goals[goalIndex].completionPercentage = completionPercentage;
    goals[goalIndex].completed = completionPercentage === 100;
  }
};

// Comment, Collaborator, and Tag Management
export const addComment = (goalId, commentText, authorId) => {
  const newComment = {
    id: (comments.length + 1).toString(),
    goalId,
    text: commentText,
    date: new Date().toISOString(),
    authorId,
  };
  comments.push(newComment);
  return newComment;
};

export const addCollaborator = (goalId, collaboratorId) => {
  const goalIndex = goals.findIndex((g) => g.id === goalId);
  if (
    goalIndex !== -1 &&
    !goals[goalIndex].collaborators.includes(collaboratorId)
  ) {
    goals[goalIndex].collaborators.push(collaboratorId);
    return true;
  }
  return false;
};

export const addTag = (goalId, tagId) => {
  const goalIndex = goals.findIndex((g) => g.id === goalId);
  if (goalIndex !== -1 && !goals[goalIndex].tags.includes(tagId)) {
    goals[goalIndex].tags.push(tagId);
    return true;
  }
  return false;
};

export const removeTag = (goalId, tagId) => {
  const goalIndex = goals.findIndex((g) => g.id === goalId);
  if (goalIndex !== -1) {
    goals[goalIndex].tags = goals[goalIndex].tags.filter((t) => t !== tagId);
    return true;
  }
  return false;
};

// Goal CRUD Operations
export const addGoal = (newGoal) => {
  // Ensure the goal has proper duration structure
  const goalWithDuration = {
    ...newGoal,
    duration: {
      startDate:
        newGoal.duration?.startDate || new Date().toISOString().split("T")[0],
      endDate: newGoal.duration?.endDate || newGoal.duration?.startDate,
    },
  };
  goals = [...goals, goalWithDuration];
  return goalWithDuration;
};

export const updateGoal = (updatedGoal) => {
  goals = goals.map((goal) =>
    goal.id === updatedGoal.id ? updatedGoal : goal
  );
  return updatedGoal;
};

// Helper function to check if a goal is overdue
export const isGoalOverdue = (goalId) => {
  const goal = goals.find((g) => g.id === goalId);
  if (!goal || goal.completed) return false;

  const currentDate = new Date();
  const endDate = new Date(goal.duration.endDate);
  return currentDate > endDate;
};

// Helper function to get goal duration in months
export const getGoalDurationInMonths = (goalId) => {
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return 0;

  const startDate = new Date(goal.duration.startDate);
  const endDate = new Date(goal.duration.endDate);

  return Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
};

export const deleteGoal = (goalId) => {
  const goalIndex = goals.findIndex((goal) => goal.id === goalId);
  if (goalIndex !== -1) {
    goals.splice(goalIndex, 1);
    return true;
  }
  return false;
};

// Additional Goal and Subtask Functions
export const addTagToGoal = (goalId, newTag) => {
  const goal = goals.find((goal) => goal.id === goalId);
  if (goal && !goal.tags.some((tag) => tag.name === newTag.name)) {
    goal.tags.push(newTag);
    return true;
  }
  return false;
};

export const updateGoalCompletionStatus = (goalId, completed) => {
  const goalIndex = goals.findIndex((g) => g.id === goalId.toString());
  if (goalIndex !== -1) {
    goals[goalIndex].completed = completed;
    goals[goalIndex].completionPercentage = completed
      ? 100
      : calculateGoalCompletionPercentage(goalId);
  }
};

const calculateGoalCompletionPercentage = (goalId) => {
  const relatedTasks = tasks.filter((t) => t.goalId === goalId);
  const allRelatedSubtasks = relatedTasks.flatMap((task) =>
    subtasks.filter((st) => st.taskId === task.id)
  );
  const completedCount = allRelatedSubtasks.filter((st) => st.completed).length;
  return allRelatedSubtasks.length
    ? (completedCount / allRelatedSubtasks.length) * 100
    : 0;
};

// Batch Goal Management
export const updateMultipleGoalsStatus = (goalIds, completionStatus) => {
  const idsToUpdate = goalIds.map((id) => id.toString());
  goals = goals.map((goal) => {
    if (idsToUpdate.includes(goal.id)) {
      return {
        ...goal,
        completionPercentage: completionStatus ? 100 : 0,
        completed: completionStatus,
      };
    }
    return goal;
  });
  return true;
};

export const deleteMultipleGoals = (goalIds) => {
  const idsToDelete = goalIds.map((id) => id.toString());
  tasks = tasks.filter((task) => !idsToDelete.includes(task.goalId));
  subtasks = subtasks.filter(
    (subtask) => !idsToDelete.includes(subtask.goalId)
  );
  const initialLength = goals.length;
  goals = goals.filter((goal) => !idsToDelete.includes(goal.id));
  return goals.length < initialLength;
};

// Archive Management
let archivedGoals = [];

export const archiveMultipleGoals = (goalIds) => {
  const idsToArchive = goalIds.map((id) => id.toString());
  const goalsToArchive = goals.filter((goal) => idsToArchive.includes(goal.id));
  archivedGoals = [...archivedGoals, ...goalsToArchive];
  goals = goals.filter((goal) => !idsToArchive.includes(goal.id));
  return true;
};

export const getArchivedGoals = () => archivedGoals;

// Add to dataService.js
export const addTask = (newTask) => {
  // Generate new ID (simple implementation - in production use UUID)
  const taskId = (tasks.length + 1).toString();
  const task = {
    id: taskId,
    name: newTask.name,
    description: newTask.description,
    priority: newTask.priority || "Medium",
    startDate: newTask.startDate || new Date().toISOString().split("T")[0],
    endDate: newTask.endDate,
    completed: false,
    goalId: newTask.goalId,
    completionPercentage: 0,
  };

  tasks.push(task);
  return task;
};

export const addSubtask = (newSubtask) => {
  const subtaskWithId = {
    ...newSubtask,
    id: (subtasks.length + 1).toString(),
    completed: false,
  };
  subtasks.push(subtaskWithId);
  return subtaskWithId;
};

// Helper function to get tasks by goal ID
export const getTasksByGoalId = (goalId) => {
  return tasks.filter((task) => task.goalId === goalId);
};
