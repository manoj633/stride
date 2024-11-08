const goals = [
  {
    _id: "1",
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
    _id: "2",
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
    _id: "3",
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
    _id: "4",
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
    _id: "5",
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
    _id: "6",
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
    _id: "7",
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
    _id: "8",
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
    _id: "9",
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
    _id: "10",
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
    _id: "11",
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
    _id: "12",
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

export default goals;
