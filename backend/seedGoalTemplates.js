import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import goalTemplates from "./data/goalTemplates.js";
import GoalTemplate from "./models/goalTemplateModel.js";
import connectDB from "./config/db.js";

const seedGoalTemplates = async () => {
  try {
    await connectDB();
    // Only insert if not already present (avoid duplicates)
    for (const template of goalTemplates) {
      const exists = await GoalTemplate.findOne({ title: template.title });
      if (!exists) {
        await GoalTemplate.create(template);
        console.log(colors.green(`Inserted template: ${template.title}`));
      } else {
        console.log(colors.yellow(`Skipped existing template: ${template.title}`));
      }
    }
    console.log(colors.green("Goal templates seeding complete!"));
    process.exit();
  } catch (error) {
    console.error(colors.red(error));
    process.exit(1);
  }
};

seedGoalTemplates();
