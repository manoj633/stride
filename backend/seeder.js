import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";

//seeder data imports
import users from "./data/users.js";
import goals from "./data/goals.js";
import tasks from "./data/tasks.js";
import subtasks from "./data/subtasks.js";
import tags from "./data/tag.js";
import comments from "./data/comments.js";

//models import
import User from "./models/userModel.js";
import Goal from "./models/goalModel.js";
import Task from "./models/taskModel.js";
import Subtask from "./models/subtaskModel.js";
import Tag from "./models/tagModel.js";
import Comment from "./models/commentModel.js";

import connectDB from "./config/db.js";

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Goal.deleteMany();
    await Task.deleteMany();
    await Subtask.deleteMany();
    await User.deleteMany();
    await Tag.deleteMany();
    await Comment.deleteMany();

    const createdUsers = await User.insertMany(users);
    const createdTags = await Tag.insertMany(tags);

    // Map tags by their original `id` field for easy access
    const tagMap = {};
    createdTags.forEach((tag, i) => {
      tagMap[i] = tag._id;
    });

    const adminUser = createdUsers[0]._id;

    const sampleGoals = goals.map((goal) => {
      const goalTags = goal.tags.map((tagId) => tagMap[tagId - 1]);
      return {
        ...goal,
        collaborators: [adminUser],
        tags: goalTags,
        createdBy: adminUser,
      };
    });
    const createdGoals = await Goal.insertMany(sampleGoals);

    // Map goal IDs to MongoDB _ids for tasks
    const goalMap = {};
    createdGoals.forEach((goal, i) => {
      goalMap[i] = goal._id;
    });

    // Update tasks with MongoDB goal _ids
    const sampleTasks = tasks.map((task) => ({
      ...task,
      goalId: goalMap[task.goalId - 1], // Replace `goalId` with MongoDB _id
      createdBy: adminUser,
    }));
    const createdTasks = await Task.insertMany(sampleTasks);

    // Map task IDs for easy access in subtasks
    const taskMap = {};
    createdTasks.forEach((task, i) => {
      taskMap[i] = task._id;
    });

    // Prepare subtasks with task and goal references
    const sampleSubtasks = subtasks.map((subtask) => {
      return {
        ...subtask,
        taskId: taskMap[subtask.taskId - 1],
        goalId: goalMap[subtask.goalId - 1],
        createdBy: adminUser,
      };
    });
    await Subtask.insertMany(sampleSubtasks);

    const sampleComments = comments.map((comment) => {
      return {
        ...comment,
        goalId: goalMap[comment.goalId - 1],
        authorId: adminUser,
      };
    });
    await Comment.insertMany(sampleComments);

    console.log("Data Imported!".green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Goal.deleteMany();
    await mongoose.connection.collection("task").dropIndexes();

    await Task.deleteMany();
    await Subtask.deleteMany();
    await User.deleteMany();
    await mongoose.connection.collection("tags").dropIndexes();
    await Tag.deleteMany();
    await Comment.deleteMany();

    console.log("Data Destroyed!".red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
