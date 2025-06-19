// backend/data/goalTemplates.js

const goalTemplates = [
  {
    title: "Learn a New Programming Language",
    description: "Master the basics and build a project in a new language.",
    category: "Education",
    priority: "High",
    duration: {
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    },
    tags: [], // Add tag ObjectIds if available
    subtasks: [
      {
        title: "Choose a language",
        description: "Pick a language to learn.",
        completed: false,
      },
      {
        title: "Complete an online course",
        description: "Finish a beginner course.",
        completed: false,
      },
      {
        title: "Build a small project",
        description: "Apply your knowledge.",
        completed: false,
      },
    ],
    isPublic: true,
    createdBy: null,
  },
  {
    title: "Read 5 Technical Books",
    description: "Expand your knowledge by reading 5 books in your field.",
    category: "Education",
    priority: "Medium",
    duration: {
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
    },
    tags: [],
    subtasks: [
      {
        title: "Select 5 books",
        description: "Make a reading list.",
        completed: false,
      },
      {
        title: "Read and summarize each book",
        description: "Take notes and summarize key points.",
        completed: false,
      },
    ],
    isPublic: true,
    createdBy: null,
  },
  {
    title: "Complete a Certification",
    description: "Prepare for and pass a professional certification exam.",
    category: "Career",
    priority: "High",
    duration: {
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 4)),
    },
    tags: [],
    subtasks: [
      {
        title: "Choose a certification",
        description: "Pick a relevant certification.",
        completed: false,
      },
      {
        title: "Study the syllabus",
        description: "Go through all required topics.",
        completed: false,
      },
      {
        title: "Take practice exams",
        description: "Assess your readiness.",
        completed: false,
      },
      {
        title: "Schedule and take the exam",
        description: "Book and complete the exam.",
        completed: false,
      },
    ],
    isPublic: true,
    createdBy: null,
  },
];

export default goalTemplates;
