import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";

//seeder data imports
import users from "./data/userss.js";
import goals from "./data/goals.js";
import tasks from "./data/tasks.js";
import subtasks from "./data/subtasks.js";

//models import
import User from "./models/userModel.js";
import Goal from "./models/goalModel.js";
import Task from "./models/taskModel.js";
import Subtask from "./models/subtaskModel.js";

import connectDB from "./config/db.js";

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Goal.deleteMany();
    await Task.deleteMany();
    await Subtask.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany(users);
  } catch (error) {}
};
