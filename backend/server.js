import express from "express";
import goals from "./data/goals.js";
import tasks from "./data/tasks.js";
import subtasks from "./data/subtasks.js";

const port = 5000;
const app = express();
app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/api/goals", (req, res) => {
  res.json(goals);
});

app.get("/api/goals/:id", (req, res) => {
  const goal = goals.find((g) => {
    return g._id === req.params.id;
  });
  res.json(goal);
});

app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

app.get("/api/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t._id === req.params.id);
  res.json(task);
});

app.get("/api/subtasks/:id", (req, res) => {
  const subtask = subtasks.find((s) => s._id === req.params.id);
  res.json(subtask);
});

app.get("/api/subtasks", (req, res) => {
  res.json(subtasks);
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
