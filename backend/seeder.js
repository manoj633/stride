import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";

//seeder data imports
import users from "./data/users.js";
import goals from "./data/goals.js";
import tasks from "./data/tasks.js";
import subtasks from "./data/subtasks.js";
import tags from "./data/tag.js";

//models import
import User from "./models/userModel.js";
import Goal from "./models/goalModel.js";
import Task from "./models/taskModel.js";
import Subtask from "./models/subtaskModel.js";
import Tag from "./models/tagModel.js";

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

    const createdUsers = await User.insertMany(users);
    const createdTags = await Tag.insertMany(tags);

    // Map tags by their original `id` field for easy access
    const tagMap = {};
    createdTags.forEach((tag) => {
      tagMap[tag.id] = tag._id;
    });

    const adminUser = createdUsers[0]._id;

    const sampleGoals = goals.map((goal) => {
      const goalTags = goal.tags.map((tagId) => tagMap[tagId]); // Map goal tag IDs to MongoDB _ids
      return {
        ...goal,
        collaborators: [adminUser],
        tags: goalTags,
      };
    });
    const createdGoals = await Goal.insertMany(sampleGoals);

    // Map goal IDs to MongoDB _ids for tasks
    const goalMap = {};
    createdGoals.forEach((goal) => {
      goalMap[goal.id] = goal._id;
    });

    // Update tasks with MongoDB goal _ids
    const sampleTasks = tasks.map((task) => ({
      ...task,
      goalId: goalMap[task.goalId], // Replace `goalId` with MongoDB _id
    }));
    await Task.insertMany(sampleTasks);

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
